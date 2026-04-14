<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OportunidadResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'cliente_id' => $this->cliente_id,
            'titulo' => $this->titulo,
            'descripcion' => $this->descripcion,
            'valor_estimado' => $this->valor_estimado,
            'fase' => $this->fase,
            'probabilidad' => $this->probabilidad,
            'fecha_cierre_estimada' => optional($this->fecha_cierre_estimada)?->toDateString(),
            'estado' => $this->estado,
            'cliente' => $this->whenLoaded('cliente', fn () => $this->cliente ? [
                'id' => $this->cliente->id,
                'nombre_completo' => $this->cliente->nombre_completo,
                'empresa' => $this->cliente->empresa,
                'estado' => $this->cliente->estado,
            ] : null),
            'actividades_count' => $this->whenCounted('actividades'),
            'tareas_count' => $this->whenCounted('tareas'),
            'actividades' => $this->whenLoaded('actividades', fn () => $this->actividades->map(fn ($actividad) => [
                'id' => $actividad->id,
                'tipo' => $actividad->tipo,
                'asunto' => $actividad->asunto,
                'fecha_actividad' => optional($actividad->fecha_actividad)?->toIso8601String(),
                'completada' => $actividad->completada,
            ])->values()),
            'tareas' => $this->whenLoaded('tareas', fn () => $this->tareas->map(fn ($tarea) => [
                'id' => $tarea->id,
                'titulo' => $tarea->titulo,
                'estado' => $tarea->estado,
                'prioridad' => $tarea->prioridad,
                'fecha_vencimiento' => optional($tarea->fecha_vencimiento)?->toIso8601String(),
            ])->values()),
            'created_at' => optional($this->created_at)?->toIso8601String(),
            'updated_at' => optional($this->updated_at)?->toIso8601String(),
            'deleted_at' => optional($this->deleted_at)?->toIso8601String(),
        ];
    }
}
