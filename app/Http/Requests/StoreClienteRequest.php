<?php

namespace App\Http\Requests;

use App\Models\Cliente;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreClienteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nombre' => ['required', 'string', 'max:255'],
            'apellidos' => ['nullable', 'string', 'max:255'],
            'empresa' => ['nullable', 'string', 'max:255'],
            'email' => [
                'nullable',
                'email:rfc',
                'max:255',
                Rule::unique('clientes', 'email')->where(fn ($query) => $query->whereNull('deleted_at')),
            ],
            'telefono' => ['nullable', 'string', 'max:50'],
            'movil' => ['nullable', 'string', 'max:50'],
            'direccion' => ['nullable', 'string', 'max:255'],
            'ciudad' => ['nullable', 'string', 'max:255'],
            'provincia' => ['nullable', 'string', 'max:255'],
            'codigo_postal' => ['nullable', 'string', 'max:20'],
            'pais' => ['nullable', 'string', 'max:255'],
            'web' => ['nullable', 'url', 'max:255'],
            'origen' => ['nullable', 'string', 'max:255'],
            'estado' => ['required', Rule::in(Cliente::ESTADOS)],
            'notas' => ['nullable', 'string'],
        ];
    }
}
