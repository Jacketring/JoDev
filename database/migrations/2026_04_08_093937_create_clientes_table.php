<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clientes', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->string('apellidos')->nullable();
            $table->string('empresa')->nullable();
            $table->string('email')->nullable()->index();
            $table->string('telefono')->nullable();
            $table->string('movil')->nullable();
            $table->string('direccion')->nullable();
            $table->string('ciudad')->nullable();
            $table->string('provincia')->nullable();
            $table->string('codigo_postal')->nullable();
            $table->string('pais')->nullable();
            $table->string('web')->nullable();
            $table->string('origen')->nullable();
            $table->string('estado')->default('activo')->index();
            $table->text('notas')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['empresa', 'estado']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clientes');
    }
};
