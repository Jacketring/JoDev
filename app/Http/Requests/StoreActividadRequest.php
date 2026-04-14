<?php

namespace App\Http\Requests;

use App\Http\Requests\Concerns\ValidatesCrmRelations;
use App\Models\Contacto;
use App\Models\Actividad;
use App\Models\Oportunidad;
use Closure;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreActividadRequest extends FormRequest
{
    use ValidatesCrmRelations;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $clienteId = $this->integer('cliente_id') ?: null;

        return [
            'cliente_id' => ['required', 'integer', $this->activeExists('clientes')],
            'contacto_id' => [
                'nullable',
                'integer',
                $this->activeExists('contactos'),
                function (string $attribute, mixed $value, Closure $fail) use ($clienteId) {
                    $this->ensureBelongsToCliente($clienteId, $value, Contacto::class, 'contacto', $fail);
                },
            ],
            'oportunidad_id' => [
                'nullable',
                'integer',
                $this->activeExists('oportunidades'),
                function (string $attribute, mixed $value, Closure $fail) use ($clienteId) {
                    $this->ensureBelongsToCliente($clienteId, $value, Oportunidad::class, 'oportunidad', $fail);
                },
            ],
            'tipo' => ['required', Rule::in(Actividad::TIPOS)],
            'asunto' => ['required', 'string', 'max:255'],
            'descripcion' => ['nullable', 'string'],
            'fecha_actividad' => ['required', 'date'],
            'completada' => ['boolean'],
        ];
    }
}
