using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HappyHabitat.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPersonasHorasPorReservacion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "PersonasPorReservacion",
                table: "Amenities",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "HorasPorReservacion",
                table: "Amenities",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "HorasReservadas",
                table: "AmenityReservations",
                type: "int",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PersonasPorReservacion",
                table: "Amenities");

            migrationBuilder.DropColumn(
                name: "HorasPorReservacion",
                table: "Amenities");

            migrationBuilder.DropColumn(
                name: "HorasReservadas",
                table: "AmenityReservations");
        }
    }
}
