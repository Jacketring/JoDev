<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ActividadResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'cliente_id' => $this->cliente_id,
            'contacto_id' => $this->contacto_id,
            'oportunidad_id' => $this->oportunidad_id,
            'tipo' => $this->tipo,
            'asunto' => $this->asunto,
            'descripcion' => $this->descripcion,
            'fecha_actividad' => optional($this->fecha_actividad)?->toIso8601String(),
            'completada' => (bool) $this->completada,
            'created_at' => optional($this->created_at)?->toIso8601String(),
            'updated_at' => optional($this->updated_at)?->toIso8601String(),
            'deleted_at' => optional($this->deleted_at)?->toIso8601String(),
            'cliente' => $this->whenLoaded('cliente', function () {
                return [
                    'id' => $this->cliente?->id,
                    'nombre_completo' => $this->cliente?->nombre_completo,
                    'empresa' => $this->cliente?->empresa,
                ];
            }),
            'contacto' => $this->whenLoaded('contacto', function () {
                return [
                    'id' => $this->contacto?->id,
                    'nombre_completo' => $this->contacto?->nombre_completo,
                    'cargo' => $this->contacto?->cargo,
                ];
            }),
            'oportunidad' => $this->whenLoaded('oportunidad', function () {
                return [
                    'id' => $this->oportunidad?->id,
                    'titulo' => $this->oportunidad?->titulo,
                    'fase' => $this->oportunidad?->fase,
                    'estado' => $this->oportunidad?->estado,
                ];
            }),
        ];
    }
}
