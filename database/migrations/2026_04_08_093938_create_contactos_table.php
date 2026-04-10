<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contactos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cliente_id')->constrained('clientes')->cascadeOnDelete();
            $table->string('nombre');
            $table->string('apellidos')->nullable();
            $table->string('cargo')->nullable();
            $table->string('email')->nullable()->index();
            $table->string('telefono')->nullable();
            $table->string('movil')->nullable();
            $table->boolean('es_principal')->default(false)->index();
            $table->text('notas')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['cliente_id', 'nombre']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contactos');
    }
};
