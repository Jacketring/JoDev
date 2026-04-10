<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email:rfc', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'max:255'],
            'role' => ['required', Rule::in(User::ROLES)],
            'cliente_id' => [
                'nullable',
                Rule::exists('clientes', 'id')->where(fn ($query) => $query->whereNull('deleted_at')),
                Rule::requiredIf(fn () => $this->input('role') === 'cliente'),
            ],
        ];
    }
}
