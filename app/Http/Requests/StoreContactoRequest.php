<?php

namespace App\Http\Requests;

use App\Http\Requests\Concerns\ValidatesCrmRelations;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreContactoRequest extends FormRequest
{
    use ValidatesCrmRelations;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'cliente_id' => ['required', 'integer', $this->activeExists('clientes')],
            'nombre' => ['required', 'string', 'max:255'],
            'apellidos' => ['nullable', 'string', 'max:255'],
            'cargo' => ['nullable', 'string', 'max:255'],
            'email' => [
                'nullable',
                'email:rfc',
                'max:255',
                Rule::unique('contactos', 'email')->where(fn ($query) => $query->whereNull('deleted_at')),
            ],
            'telefono' => ['nullable', 'string', 'max:50'],
            'movil' => ['nullable', 'string', 'max:50'],
            'es_principal' => ['boolean'],
            'notas' => ['nullable', 'string'],
        ];
    }
}
