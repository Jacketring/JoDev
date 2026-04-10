<?php

namespace App\Http\Requests;

use App\Models\Tarea;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTareaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'cliente_id' => [
                'nullable',
                Rule::exists('clientes', 'id')->where(fn ($query) => $query->whereNull('deleted_at')),
            ],
            'contacto_id' => [
                'nullable',
                Rule::exists('contactos', 'id')->where(fn ($query) => $query->whereNull('deleted_at')),
            ],
            'oportunidad_id' => [
                'nullable',
                Rule::exists('oportunidades', 'id')->where(fn ($query) => $query->whereNull('deleted_at')),
            ],
            'titulo' => ['required', 'string', 'max:255'],
            'descripcion' => ['nullable', 'string'],
            'prioridad' => ['required', Rule::in(Tarea::PRIORIDADES)],
            'estado' => ['required', Rule::in(Tarea::ESTADOS)],
            'fecha_vencimiento' => ['nullable', 'date'],
        ];
    }
}
