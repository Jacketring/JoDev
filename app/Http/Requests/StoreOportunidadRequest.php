<?php

namespace App\Http\Requests;

use App\Http\Requests\Concerns\ValidatesCrmRelations;
use App\Models\Oportunidad;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreOportunidadRequest extends FormRequest
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
            'titulo' => ['required', 'string', 'max:255'],
            'descripcion' => ['nullable', 'string'],
            'valor_estimado' => ['nullable', 'numeric', 'min:0'],
            'fase' => ['required', Rule::in(Oportunidad::FASES)],
            'probabilidad' => ['required', 'integer', 'between:0,100'],
            'fecha_cierre_estimada' => ['nullable', 'date'],
            'estado' => ['required', Rule::in(Oportunidad::ESTADOS)],
        ];
    }
}
