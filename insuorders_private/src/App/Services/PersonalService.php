<?php
namespace App\Services;

use App\Repositories\PersonalRepository;

class PersonalService {
    private $repo;

    public function __construct() {
        $this->repo = new PersonalRepository();
    }

    public function listarEmpleados() {
        return $this->repo->getAll();
    }
}