<?php

namespace App\Http\Requests;

use App\Models\Tarea;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTareaRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $payload = [
            'prioridad' => $this->input('prioridad') ?: 'media',
            'estado' => $this->input('estado') ?: 'pendiente',
            'cliente_id' => null,
            'contacto_id' => null,
            'oportunidad_id' => null,
        ];

        if ($this->has('fecha_vencimiento') && $this->input('fecha_vencimiento') === '') {
            $payload['fecha_vencimiento'] = null;
        }

        $this->merge($payload);
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
            'assigned_user_id' => [
                'required',
                'integer',
                Rule::exists('users', 'id'),
            ],
            'titulo' => ['required', 'string', 'max:255'],
            'descripcion' => ['nullable', 'string'],
            'prioridad' => ['nullable', Rule::in(Tarea::PRIORIDADES)],
            'estado' => ['nullable', Rule::in(Tarea::ESTADOS)],
            'fecha_vencimiento' => ['nullable', 'date'],
        ];
    }
}
