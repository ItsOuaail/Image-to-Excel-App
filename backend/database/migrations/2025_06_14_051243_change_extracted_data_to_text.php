<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('conversions', function (Blueprint $table) {
            // Change extracted_data from JSON to TEXT
            $table->text('extracted_data')->nullable()->change();
        });
    }

    public function down()
    {
        Schema::table('conversions', function (Blueprint $table) {
            // Revert back to JSON if needed
            $table->json('extracted_data')->nullable()->change();
        });
    }
};