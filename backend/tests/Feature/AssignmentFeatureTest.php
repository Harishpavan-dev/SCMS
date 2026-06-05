<?php

namespace Tests\Feature;

use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\Batch;
use App\Models\Lecturer;
use App\Models\Semester;
use App\Models\Student;
use App\Models\Subject;
use App\Models\User;
use App\Services\JWTService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AssignmentFeatureTest extends TestCase
{
    use RefreshDatabase;

    private JWTService $jwtService;
    private User $lecturerUser;
    private Lecturer $lecturer;
    private User $studentUser;
    private Student $student;
    private Semester $semester;
    private Subject $subject;
    private Batch $batch;

    protected function setUp(): void
    {
        parent::setUp();

        $this->jwtService = $this->app->make(JWTService::class);

        // Create a semester
        $this->semester = Semester::create([
            'name' => 'Year 1 - Semester 1',
            'number' => 1,
            'start_date' => now()->subMonth(),
            'end_date' => now()->addMonths(5),
        ]);

        // Create a subject
        $this->subject = Subject::create([
            'code' => 'IT1101',
            'name' => 'IT Concepts',
            'credit_hours' => 3,
            'semester_id' => $this->semester->id,
        ]);

        // Create lecturer
        $this->lecturerUser = User::create([
            'name' => 'Dr. Lecturer',
            'email' => 'lecturer@atijaffna.lk',
            'password' => bcrypt('password'),
            'role' => 'lecturer',
            'is_active' => true,
        ]);

        $this->lecturer = Lecturer::create([
            'user_id' => $this->lecturerUser->id,
            'employee_id' => 'LEC001',
            'department' => 'IT',
        ]);

        // Assign subject to lecturer
        $this->lecturer->subjects()->attach($this->subject->id);

        // Create batch
        $this->batch = Batch::create([
            'name' => 'HNDIT 2024',
            'year' => 2024,
        ]);

        // Create student
        $this->studentUser = User::create([
            'name' => 'Test Student',
            'email' => 'student@atijaffna.lk',
            'password' => bcrypt('password'),
            'role' => 'student',
            'is_active' => true,
        ]);

        $this->student = Student::create([
            'user_id' => $this->studentUser->id,
            'registration_number' => 'ATI/HNDIT/2024/001',
            'nic_number' => '200200001V',
            'date_of_birth' => '2002-01-01',
            'gender' => 'male',
            'batch_id' => $this->batch->id,
            'current_semester_id' => $this->semester->id,
            'status' => 'active',
        ]);
    }

    private function getAuthHeader(User $user): array
    {
        $token = $this->jwtService->generateToken($user);
        return ['Authorization' => 'Bearer ' . $token];
    }

    public function test_lecturer_can_get_assigned_subjects()
    {
        $response = $this->getJson('/api/lecturer/subjects', $this->getAuthHeader($this->lecturerUser));

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ])
            ->assertJsonFragment([
                'id' => $this->subject->id,
                'code' => $this->subject->code,
            ]);
    }

    public function test_lecturer_can_create_assignment()
    {
        Queue::fake();
        Storage::fake('public');

        $file = UploadedFile::fake()->create('assignment_instructions.pdf', 100);

        $payload = [
            'subject_id' => $this->subject->id,
            'title' => 'Test Assignment 1',
            'description' => 'Instructions detail',
            'deadline' => now()->addDays(7)->toIso8601String(),
            'file' => $file,
        ];

        $response = $this->postJson('/api/assignments', $payload, $this->getAuthHeader($this->lecturerUser));

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
            ]);

        $this->assertDatabaseHas('assignments', [
            'subject_id' => $this->subject->id,
            'title' => 'Test Assignment 1',
            'original_name' => 'assignment_instructions.pdf',
        ]);

        // Verify notification is created for the student
        $this->assertDatabaseHas('notifications', [
            'user_id' => $this->studentUser->id,
            'title' => 'New Assignment Posted',
        ]);
    }

    public function test_student_can_view_assignments_and_submit()
    {
        Queue::fake();
        Storage::fake('public');

        // Create assignment first
        $assignment = Assignment::create([
            'subject_id' => $this->subject->id,
            'lecturer_id' => $this->lecturer->id,
            'title' => 'Test Assignment 1',
            'description' => 'Detail instructions',
            'deadline' => now()->addDays(2),
        ]);

        // Student lists assignments
        $response = $this->getJson('/api/assignments', $this->getAuthHeader($this->studentUser));
        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ])
            ->assertJsonFragment([
                'title' => 'Test Assignment 1',
            ]);

        // Student submits work
        $file = UploadedFile::fake()->create('my_submission.zip', 500);
        $submitResponse = $this->postJson("/api/assignments/{$assignment->id}/submit", [
            'file' => $file,
        ], $this->getAuthHeader($this->studentUser));

        $submitResponse->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);

        $this->assertDatabaseHas('assignment_submissions', [
            'assignment_id' => $assignment->id,
            'student_id' => $this->student->id,
            'original_name' => 'my_submission.zip',
        ]);
    }

    public function test_lecturer_can_grade_submission()
    {
        Queue::fake();

        $assignment = Assignment::create([
            'subject_id' => $this->subject->id,
            'lecturer_id' => $this->lecturer->id,
            'title' => 'Test Assignment 1',
            'description' => 'Detail instructions',
            'deadline' => now()->addDays(2),
        ]);

        $submission = AssignmentSubmission::create([
            'assignment_id' => $assignment->id,
            'student_id' => $this->student->id,
            'file_path' => 'submissions/fake_file.pdf',
            'original_name' => 'fake_file.pdf',
            'submitted_at' => now(),
        ]);

        $gradePayload = [
            'grade' => 'A+',
            'feedback' => 'Great submission!',
        ];

        $response = $this->postJson("/api/submissions/{$submission->id}/grade", $gradePayload, $this->getAuthHeader($this->lecturerUser));

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);

        $this->assertDatabaseHas('assignment_submissions', [
            'id' => $submission->id,
            'grade' => 'A+',
            'feedback' => 'Great submission!',
        ]);

        // Verify notification is created for the student
        $this->assertDatabaseHas('notifications', [
            'user_id' => $this->studentUser->id,
            'title' => 'Assignment Graded',
        ]);
    }

    public function test_lecturer_can_load_dashboard()
    {
        $response = $this->getJson('/api/dashboard', $this->getAuthHeader($this->lecturerUser));

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);
    }

    public function test_student_can_load_dashboard()
    {
        $response = $this->getJson('/api/dashboard', $this->getAuthHeader($this->studentUser));

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);
    }

    public function test_lecturer_can_mark_attendance_direct()
    {
        $payload = [
            'subject_id' => $this->subject->id,
            'batch_id' => $this->batch->id,
            'semester_id' => $this->semester->id,
            'date' => now()->toDateString(),
            'period' => 1,
            'student_id' => $this->student->id,
            'status' => 'present',
        ];

        $response = $this->postJson('/api/attendance/mark-direct', $payload, $this->getAuthHeader($this->lecturerUser));

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);

        $this->assertDatabaseHas('attendance_records', [
            'student_id' => $this->student->id,
            'status' => 'present',
            'method' => 'manual',
        ]);
    }
}
