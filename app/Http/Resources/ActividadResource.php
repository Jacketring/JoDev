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
            'assigned_user_id' => $this->assigned_user_id,
            'tipo' => $this->tipo,
            'asunto' => $this->asunto,
            'descripcion' => $this->descripcion,
            'fecha_actividad' => optional($this->fecha_actividad)?->toIso8601String(),
            'completada' => $this->completada,
            'cliente' => $this->whenLoaded('cliente', fn () => $this->cliente ? [
                'id' => $this->cliente->id,
                'nombre_completo' => $this->cliente->nombre_completo,
                'empresa' => $this->cliente->empresa,
                'estado' => $this->cliente->estado,
            ] : null),
            'contacto' => $this->whenLoaded('contacto', fn () => $this->contacto ? [
                'id' => $this->contacto->id,
                'nombre_completo' => $this->contacto->nombre_completo,
                'cargo' => $this->contacto->cargo,
                'email' => $this->contacto->email,
            ] : null),
            'oportunidad' => $this->whenLoaded('oportunidad', fn () => $this->oportunidad ? [
                'id' => $this->oportunidad->id,
                'titulo' => $this->oportunidad->titulo,
                'fase' => $this->oportunidad->fase,
                'estado' => $this->oportunidad->estado,
            ] : null),
            'assigned_user' => $this->whenLoaded('assignedUser', fn () => $this->assignedUser ? [
                'id' => $this->assignedUser->id,
                'name' => $this->assignedUser->name,
                'email' => $this->assignedUser->email,
                'role' => $this->assignedUser->role,
            ] : null),
            'created_at' => optional($this->created_at)?->toIso8601String(),
            'updated_at' => optional($this->updated_at)?->toIso8601String(),
            'deleted_at' => optional($this->deleted_at)?->toIso8601String(),
        ];
    }
}
