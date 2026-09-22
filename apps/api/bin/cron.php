<?php
declare(strict_types=1);

require_once dirname(__DIR__) . '/bootstrap.php';

$limit = isset($argv[1]) ? max(1, min(10, (int)$argv[1])) : 5;
$result = (new Qixu\Jobs(Qixu\Database::connection()))->runBatch($limit);
fwrite(STDOUT, json_encode($result, JSON_THROW_ON_ERROR | JSON_PRETTY_PRINT) . PHP_EOL);
