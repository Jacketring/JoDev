<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('oportunidades', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cliente_id')->constrained('clientes')->cascadeOnDelete();
            $table->string('titulo');
            $table->text('descripcion')->nullable();
            $table->decimal('valor_estimado', 12, 2)->default(0);
            $table->string('fase')->default('nuevo')->index();
            $table->unsignedTinyInteger('probabilidad')->default(0);
            $table->date('fecha_cierre_estimada')->nullable();
            $table->string('estado')->default('abierta')->index();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['cliente_id', 'fase', 'estado']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('oportunidades');
    }
};
