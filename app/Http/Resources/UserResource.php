<?php

namespace App\Http\Resources;

use App\Support\VisualPreferences;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role,
            'cliente_id' => $this->cliente_id,
            'cliente' => $this->whenLoaded('cliente', function () {
                return [
                    'id' => $this->cliente?->id,
                    'nombre_completo' => $this->cliente?->nombre_completo,
                    'empresa' => $this->cliente?->empresa,
                    'estado' => $this->cliente?->estado,
                ];
            }),
            'visual_preferences' => VisualPreferences::normalize($this->visual_preferences),
            'created_at' => optional($this->created_at)?->toIso8601String(),
        ];
    }
}
