<?php
declare(strict_types=1);

require_once dirname(__DIR__) . '/bootstrap.php';

(new Qixu\Kernel(Qixu\Database::connection()))->handle();
