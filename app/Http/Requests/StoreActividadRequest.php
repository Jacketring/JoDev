<?php

namespace App\Http\Requests;

use App\Models\Actividad;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreActividadRequest extends FormRequest
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
            'tipo' => ['required', Rule::in(Actividad::TIPOS)],
            'asunto' => ['required', 'string', 'max:255'],
            'descripcion' => ['nullable', 'string'],
            'fecha_actividad' => ['required', 'date'],
            'completada' => ['sometimes', 'boolean'],
        ];
    }
}
