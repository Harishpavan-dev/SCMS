<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

try {
    DB::statement('SET FOREIGN_KEY_CHECKS = 0;');
    
    // Get all tables in database
    $tables = DB::select('SHOW TABLES');
    $dbName = DB::getDatabaseName();
    $tableKey = 'Tables_in_' . $dbName;
    
    foreach ($tables as $table) {
        $name = $table->$tableKey;
        if ($name !== 'migrations') {
            DB::statement("DELETE FROM `$name` ");
            echo "Cleared table: $name\n";
        }
    }
    
    $sqlFile = __DIR__ . '/../scms_db.sql';
    if (!file_exists($sqlFile)) {
        throw new Exception("File not found: " . $sqlFile);
    }
    
    $content = file_get_contents($sqlFile);
    
    // Split queries by semicolon at the end of lines
    $queries = preg_split('/;\s*$/m', $content);
    
    $insertedCount = 0;
    foreach ($queries as $query) {
        $query = trim($query);
        if (empty($query)) {
            continue;
        }
        
        // Clean comments
        $cleanQuery = preg_replace('/^(--|#|\/\*).*$/m', '', $query);
        $cleanQuery = trim($cleanQuery);
        
        if (stripos($cleanQuery, 'INSERT INTO') === 0) {
            // Skip migrations table inserts
            if (preg_match('/INSERT\s+INTO\s+`?migrations`?/i', $cleanQuery)) {
                continue;
            }
            
            DB::unprepared($cleanQuery . ';');
            $insertedCount++;
        }
    }
    
    DB::statement('SET FOREIGN_KEY_CHECKS = 1;');
    echo "SUCCESS: Executed $insertedCount INSERT INTO statements successfully!\n";
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
