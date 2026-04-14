<?php

namespace App\Http\Requests;

use App\Http\Requests\Concerns\ValidatesCrmRelations;
use App\Models\Contacto;
use App\Models\Oportunidad;
use App\Models\Tarea;
use Closure;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTareaRequest extends FormRequest
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
            'assigned_user_id' => [
                'nullable',
                'integer',
                Rule::exists('users', 'id')->where(function ($query) use ($clienteId) {
                    $query->where(function ($nested) use ($clienteId) {
                        $nested
                            ->where('role', 'administrador')
                            ->orWhere('cliente_id', $clienteId);
                    });
                }),
            ],
            'titulo' => ['required', 'string', 'max:255'],
            'descripcion' => ['nullable', 'string'],
            'prioridad' => ['required', Rule::in(Tarea::PRIORIDADES)],
            'estado' => ['required', Rule::in(Tarea::ESTADOS)],
            'fecha_vencimiento' => ['nullable', 'date'],
        ];
    }
}
