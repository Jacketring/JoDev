<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class UpdateClienteRequest extends StoreClienteRequest
{
    public function rules(): array
    {
        $cliente = $this->route('cliente');

        return [
            ...parent::rules(),
            'email' => [
                'nullable',
                'email:rfc',
                'max:255',
                Rule::unique('clientes', 'email')
                    ->ignore($cliente)
                    ->where(fn ($query) => $query->whereNull('deleted_at')),
            ],
        ];
    }
}
