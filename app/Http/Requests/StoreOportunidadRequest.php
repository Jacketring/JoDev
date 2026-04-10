<?php

namespace App\Http\Requests;

use App\Models\Oportunidad;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreOportunidadRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'cliente_id' => [
                'required',
                Rule::exists('clientes', 'id')->where(fn ($query) => $query->whereNull('deleted_at')),
            ],
            'titulo' => ['required', 'string', 'max:255'],
            'descripcion' => ['nullable', 'string'],
            'valor_estimado' => ['nullable', 'numeric', 'min:0'],
            'fase' => ['required', Rule::in(Oportunidad::FASES)],
            'probabilidad' => ['nullable', 'integer', 'between:0,100'],
            'fecha_cierre_estimada' => ['nullable', 'date'],
            'estado' => ['required', Rule::in(Oportunidad::ESTADOS)],
        ];
    }
}
