<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class UpdateContactoRequest extends StoreContactoRequest
{
    public function rules(): array
    {
        $contacto = $this->route('contacto');

        return [
            ...parent::rules(),
            'email' => [
                'nullable',
                'email:rfc',
                'max:255',
                Rule::unique('contactos', 'email')
                    ->ignore($contacto)
                    ->where(fn ($query) => $query->whereNull('deleted_at')),
            ],
        ];
    }
}
