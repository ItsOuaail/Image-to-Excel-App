<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // Check if template_id column already exists, if not add it
        if (!Schema::hasColumn('conversions', 'template_id')) {
            Schema::table('conversions', function (Blueprint $table) {
                $table->unsignedBigInteger('template_id')->nullable()->after('error_message');
                $table->foreign('template_id')->references('id')->on('conversion_templates')->onDelete('set null');
            });
        }
    }

    public function down()
    {
        if (Schema::hasColumn('conversions', 'template_id')) {
            Schema::table('conversions', function (Blueprint $table) {
                $table->dropForeign(['template_id']);
                $table->dropColumn('template_id');
            });
        }
    }
};