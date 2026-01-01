using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GreatSoft.HappyHabitat.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class SeedComunidadesData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Seed Comunidades data
            // Mapping: FRACCIONAMIENTO -> bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb
            //          COLONIA -> aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
            //          COTO -> cccccccc-cccc-cccc-cccc-cccccccccccc

            migrationBuilder.InsertData(
                table: "Comunidad",
                columns: new[] { "Id", "TipoComunidadId", "Nombre", "Ubicacion", "Lat", "Lng", "CantidadViviendas", "Contacto", "ContactoTelefono", "ContactoEmail" },
                values: new object[,]
                {
                    { "fcdc9a85-88b7-4109-84b3-a75107392d87", "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb", "Residencial El Pueblito", "Av. Paseo del Pueblito 123, El Pueblito, QRO", 20.5821m, -100.3897m, 120, "", "", "admin@elpueblito.mx" },
                    { "ff7bc6fb-0f13-4e37-beb4-7d428520c227", "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "Colonia Las Palmas", "Calle Palma Real 45, Querétaro, QRO", 20.5932m, -100.3921m, 85, "", "", "contacto@laspalmas.org" },
                    { "c4a28c40-a2c7-4190-961c-f3f52ad19c1d", "cccccccc-cccc-cccc-cccc-cccccccccccc", "Coto San Miguel", "Privada San Miguel 8, Corregidora, QRO", 20.5798m, -100.3865m, 60, "", "", "info@cotosanmiguel.com" },
                    { "aa2f0511-bedd-413c-8681-34f3eee11ac9", "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb", "Villa del Sol", "Av. del Sol 200, Querétaro, QRO", 20.6001m, -100.395m, 150, "", "", "villa@delsol.mx" },
                    { "9f3cfa42-d4cd-41b3-95d4-e8f6ffdb204c", "cccccccc-cccc-cccc-cccc-cccccccccccc", "Capital Sur - Cot Berlin", "El Marqués, QRO", 20.6105m, -100.3802m, 240, "", "", "capitalsur-cotoberlin@comunidad.org" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Remove seeded Comunidades data
            migrationBuilder.DeleteData(
                table: "Comunidad",
                keyColumn: "Id",
                keyValues: new object[]
                {
                    "fcdc9a85-88b7-4109-84b3-a75107392d87",
                    "ff7bc6fb-0f13-4e37-beb4-7d428520c227",
                    "c4a28c40-a2c7-4190-961c-f3f52ad19c1d",
                    "aa2f0511-bedd-413c-8681-34f3eee11ac9",
                    "9f3cfa42-d4cd-41b3-95d4-e8f6ffdb204c"
                });
        }
    }
}
