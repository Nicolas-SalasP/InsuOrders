<?php
namespace App\Controllers;

use App\Repositories\OrdenCompraRepository;
use App\Repositories\MantencionRepository;

class NotificationController {
    
    public function index() {
        $repoCompras = new OrdenCompraRepository();
        $repoBodega = new MantencionRepository();

        $pendientesCompras = $repoCompras->getPendientesMantencion();
        
        $pendientesBodega = $repoBodega->getPendientesEntrega();

        echo json_encode([
            "success" => true,
            "data" => [
                "compras" => count($pendientesCompras),
                "bodega" => count($pendientesBodega),
                "total" => count($pendientesCompras) + count($pendientesBodega)
            ]
        ]);
    }
}