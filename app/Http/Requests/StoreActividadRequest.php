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

    protected function prepareForValidation(): void
    {
        $clienteId = $this->input('cliente_id');
        $contactoId = $this->input('contacto_id');
        $oportunidadId = $this->input('oportunidad_id');

        if (! $clienteId && $contactoId) {
            $clienteId = Contacto::query()->whereKey($contactoId)->value('cliente_id');
        }

        if (! $clienteId && $oportunidadId) {
            $clienteId = Oportunidad::query()->whereKey($oportunidadId)->value('cliente_id');
        }

        $payload = array_filter([
            'cliente_id' => $clienteId,
        ], fn ($value) => $value !== null && $value !== '');

        if ($this->isMethod('post')) {
            $payload += [
                'tipo' => $this->input('tipo') ?: 'nota',
                'fecha_actividad' => $this->input('fecha_actividad') ?: now()->toIso8601String(),
                'completada' => $this->input('completada', false),
            ];
        }

        if ($payload !== []) {
            $this->merge($payload);
        }
    }

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $clienteId = $this->integer('cliente_id') ?: null;

        return [
            'cliente_id' => ['nullable', 'integer', $this->activeExists('clientes')],
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
            'tipo' => ['nullable', Rule::in(Actividad::TIPOS)],
            'asunto' => ['required', 'string', 'max:255'],
            'descripcion' => ['nullable', 'string'],
            'fecha_actividad' => ['nullable', 'date'],
            'completada' => ['boolean'],
        ];
    }
}
