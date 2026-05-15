import { Box, Typography, Paper, Button, Stack } from "@mui/material";
import { useForm } from "react-hook-form";
import type { LeadField, LeadFieldSection, LeadFieldType } from "src/types/leadFields";
import { LeadFormText, LeadFormNumber, LeadFormFile } from "src/features/lead/shared/LeadFormFields";
import SaveIcon from "@mui/icons-material/Save";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

// Helper to create a mock LeadFieldSection
const mockSection: LeadFieldSection = {
    id: 1,
    name: "Información General",
    organization_id: 1,
};

// Helper to create a mock LeadFieldType
const createFieldType = (code: string, description: string): LeadFieldType => ({
    id: 1,
    code,
    description,
});

// Mock lead fields for testing - matching the actual LeadField interface
const mockLeadFields: LeadField[] = [
    {
        id: 1,
        name: "Razón Social",
        campaign_id: 1,
        order: 1,
        required: true,
        is_primary: true,
        is_visible: true,
        lead_field_section_id: 1,
        default_value: null,
        input_mask: null,
        mask_template_code: null,
        field_template_code: null,
        field_type_code: "TEXT",
        field_subtype_code: "TEXT",
        nomenclator_id: null,
        related_campaign_id: null,
        calculation_expression: null,
        title_order: 1,
        configuration: undefined,
        lead_field_section: mockSection,
        organization_id: 1,
        field_type: createFieldType("TEXT", "Texto"),
        field_subtype: createFieldType("TEXT", "Texto simple"),
        field_template_name: null,
    },
    {
        id: 2,
        name: "CUIT / CUIL",
        campaign_id: 1,
        order: 2,
        required: true,
        is_primary: false,
        is_visible: true,
        lead_field_section_id: 1,
        default_value: null,
        input_mask: null,
        mask_template_code: null,
        field_template_code: null,
        field_type_code: "TEXT",
        field_subtype_code: "TEXT",
        nomenclator_id: null,
        related_campaign_id: null,
        calculation_expression: null,
        title_order: 2,
        configuration: undefined,
        lead_field_section: mockSection,
        organization_id: 1,
        field_type: createFieldType("TEXT", "Texto"),
        field_subtype: createFieldType("TEXT", "Texto simple"),
        field_template_name: null,
    },
    {
        id: 3,
        name: "Cantidad de Empleados",
        campaign_id: 1,
        order: 3,
        required: false,
        is_primary: false,
        is_visible: true,
        lead_field_section_id: 1,
        default_value: "0",
        input_mask: null,
        mask_template_code: null,
        field_template_code: null,
        field_type_code: "NUMBER",
        field_subtype_code: "INTEGER",
        nomenclator_id: null,
        related_campaign_id: null,
        calculation_expression: null,
        title_order: null,
        configuration: undefined,
        lead_field_section: mockSection,
        organization_id: 1,
        field_type: createFieldType("NUMBER", "Número"),
        field_subtype: createFieldType("INTEGER", "Entero"),
        field_template_name: null,
    },
    {
        id: 4,
        name: "Sitio Web",
        campaign_id: 1,
        order: 4,
        required: false,
        is_primary: false,
        is_visible: true,
        lead_field_section_id: 1,
        default_value: null,
        input_mask: null,
        mask_template_code: null,
        field_template_code: null,
        field_type_code: "TEXT",
        field_subtype_code: "URL",
        nomenclator_id: null,
        related_campaign_id: null,
        calculation_expression: null,
        title_order: null,
        configuration: undefined,
        lead_field_section: mockSection,
        organization_id: 1,
        field_type: createFieldType("TEXT", "Texto"),
        field_subtype: createFieldType("URL", "URL"),
        field_template_name: null,
    },
    {
        id: 5,
        name: "Email",
        campaign_id: 1,
        order: 5,
        required: true,
        is_primary: false,
        is_visible: true,
        lead_field_section_id: 1,
        default_value: null,
        input_mask: null,
        mask_template_code: null,
        field_template_code: null,
        field_type_code: "TEXT",
        field_subtype_code: "EMAIL",
        nomenclator_id: null,
        related_campaign_id: null,
        calculation_expression: null,
        title_order: null,
        configuration: undefined,
        lead_field_section: mockSection,
        organization_id: 1,
        field_type: createFieldType("TEXT", "Texto"),
        field_subtype: createFieldType("EMAIL", "Email"),
        field_template_name: null,
    },
    {
        id: 6,
        name: "Teléfono",
        campaign_id: 1,
        order: 6,
        required: false,
        is_primary: false,
        is_visible: true,
        lead_field_section_id: 1,
        default_value: null,
        input_mask: null,
        mask_template_code: null,
        field_template_code: null,
        field_type_code: "TEXT",
        field_subtype_code: "PHONE",
        nomenclator_id: null,
        related_campaign_id: null,
        calculation_expression: null,
        title_order: null,
        configuration: undefined,
        lead_field_section: mockSection,
        organization_id: 1,
        field_type: createFieldType("TEXT", "Texto"),
        field_subtype: createFieldType("PHONE", "Teléfono"),
        field_template_name: null,
    },
    {
        id: 7,
        name: "Próxima Reunión",
        campaign_id: 1,
        order: 7,
        required: false,
        is_primary: false,
        is_visible: true,
        lead_field_section_id: 1,
        default_value: null,
        input_mask: null,
        mask_template_code: null,
        field_template_code: null,
        field_type_code: "TEXT",
        field_subtype_code: "DATE",
        nomenclator_id: null,
        related_campaign_id: null,
        calculation_expression: null,
        title_order: null,
        configuration: undefined,
        lead_field_section: mockSection,
        organization_id: 1,
        field_type: createFieldType("TEXT", "Texto"),
        field_subtype: createFieldType("DATE", "Fecha"),
        field_template_name: null,
    },
    {
        id: 8,
        name: "Foto de Perfil",
        campaign_id: 1,
        order: 8,
        required: false,
        is_primary: false,
        is_visible: true,
        lead_field_section_id: 1,
        default_value: null,
        input_mask: null,
        mask_template_code: null,
        field_template_code: null,
        field_type_code: "FILE",
        field_subtype_code: "FILE_IMAGE",
        nomenclator_id: null,
        related_campaign_id: null,
        calculation_expression: null,
        title_order: null,
        configuration: undefined,
        lead_field_section: mockSection,
        organization_id: 1,
        field_type: createFieldType("FILE", "Archivo"),
        field_subtype: createFieldType("FILE_IMAGE", "Imagen"),
        field_template_name: null,
    },
    {
        id: 9,
        name: "Propuesta Comercial",
        campaign_id: 1,
        order: 9,
        required: false,
        is_primary: false,
        is_visible: true,
        lead_field_section_id: 1,
        default_value: null,
        input_mask: null,
        mask_template_code: null,
        field_template_code: null,
        field_type_code: "FILE",
        field_subtype_code: "FILE_DOCUMENT",
        nomenclator_id: null,
        related_campaign_id: null,
        calculation_expression: null,
        title_order: null,
        configuration: undefined,
        lead_field_section: mockSection,
        organization_id: 1,
        field_type: createFieldType("FILE", "Archivo"),
        field_subtype: createFieldType("FILE_DOCUMENT", "Documento"),
        field_template_name: null,
    },
    {
        id: 10,
        name: "Notas Internas",
        campaign_id: 1,
        order: 10,
        required: false,
        is_primary: false,
        is_visible: true,
        lead_field_section_id: 1,
        default_value: null,
        input_mask: null,
        mask_template_code: null,
        field_template_code: null,
        field_type_code: "TEXT",
        field_subtype_code: "TEXTAREA",
        nomenclator_id: null,
        related_campaign_id: null,
        calculation_expression: null,
        title_order: null,
        configuration: undefined,
        lead_field_section: mockSection,
        organization_id: 1,
        field_type: createFieldType("TEXT", "Texto"),
        field_subtype: createFieldType("TEXTAREA", "Área de texto"),
        field_template_name: null,
    },
];

interface FormData {
    field_1: string;
    field_2: string;
    field_3: number;
    field_4: string;
    field_5: string;
    field_6: string;
    field_7: string;
    field_8: File | null;
    field_9: File | null;
    field_10: string;
}

export const FormTestPage = () => {
    const { register, control, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
        defaultValues: {
            field_1: "",
            field_2: "",
            field_3: 0,
            field_4: "",
            field_5: "",
            field_6: "",
            field_7: "",
            field_8: null,
            field_9: null,
            field_10: "",
        }
    });

    const onSubmit = (data: FormData) => {
        console.log("Form submitted:", data);
        alert("Formulario enviado! Revisa la consola para ver los datos.");
    };

    const renderField = (field: LeadField) => {
        const name = `field_${field.id}` as keyof FormData;
        const errorMessage = errors[name]?.message;

        switch (field.field_type_code) {
            case "TEXT":
                return (
                    <LeadFormText
                        key={field.id}
                        register={register}
                        name={name}
                        label={field.name}
                        required={field.required}
                        errorMessage={errorMessage}
                        type={field.field_subtype_code === "DATE" ? "date" : field.field_subtype_code === "DATETIME" ? "datetime-local" : "text"}
                        multiline={field.field_subtype_code === "TEXTAREA"}
                    />
                );
            case "NUMBER":
                return (
                    <LeadFormNumber
                        key={field.id}
                        control={control}
                        name={name}
                        label={field.name}
                        required={field.required}
                        errorMessage={errorMessage}
                    />
                );
            case "FILE":
                return (
                    <LeadFormFile
                        key={field.id}
                        control={control}
                        name={name}
                        label={field.name}
                        leadField={field}
                        required={field.required}
                        errorMessage={errorMessage}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <Box sx={{ p: 4, maxWidth: 1400, mx: "auto" }}>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 600 }}>
                Nuevo Lead - Demo de Formulario
            </Typography>

            <Paper
                elevation={0}
                sx={{
                    p: 4,
                    borderRadius: 2,
                    bgcolor: "background.paper",
                    border: "1px solid",
                    borderColor: "divider",
                }}
            >
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: {
                                xs: "1fr",
                                sm: "repeat(2, 1fr)",
                                md: "repeat(3, 1fr)",
                                lg: "repeat(4, 1fr)",
                            },
                            gap: 3,
                        }}
                    >
                        {mockLeadFields.map(renderField)}
                    </Box>

                    <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 4 }}>
                        <Button
                            variant="outlined"
                            startIcon={<RestartAltIcon />}
                            onClick={() => reset()}
                        >
                            Limpiar
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            startIcon={<SaveIcon />}
                        >
                            Guardar Lead
                        </Button>
                    </Stack>
                </form>
            </Paper>
        </Box>
    );
};
