<?php

namespace App\Http\Requests;

use App\Models\Actividad;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreActividadRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $payload = [];

        if ($this->isMethod('post')) {
            $payload += [
                'tipo' => $this->input('tipo') ?: 'nota',
                'fecha_actividad' => $this->input('fecha_actividad') ?: now()->toIso8601String(),
                'completada' => $this->input('completada', false),
            ];
        }

        if ($payload !== []) {
            $this->merge($payload);
        }
    }

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'cliente_id' => ['nullable'],
            'contacto_id' => ['nullable'],
            'oportunidad_id' => ['nullable'],
            'assigned_user_id' => ['required', 'integer', Rule::exists('users', 'id')],
            'tipo' => ['nullable', Rule::in(Actividad::TIPOS)],
            'asunto' => ['required', 'string', 'max:255'],
            'descripcion' => ['nullable', 'string'],
            'fecha_actividad' => ['nullable', 'date'],
            'completada' => ['boolean'],
        ];
    }
}
