<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cliente;
use App\Support\CrmAccess;
use Illuminate\Http\Request;

class OpcionesController extends Controller
{
    public function __invoke(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'catalogos' => [
                'cliente_estados' => Cliente::ESTADOS,
            ],
            'clientes' => CrmAccess::applyClienteRecordScope(Cliente::query(), $user)
                ->orderBy('empresa')
                ->orderBy('nombre')
                ->get()
                ->map(fn (Cliente $cliente) => [
                    'id' => $cliente->id,
                    'nombre_completo' => $cliente->nombre_completo,
                    'empresa' => $cliente->empresa,
                    'estado' => $cliente->estado,
                ]),
        ]);
    }
}
