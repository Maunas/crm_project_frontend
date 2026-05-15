import { Box, Typography, Paper, Button, Stack } from "@mui/material";
import { useForm } from "react-hook-form";
import { type LeadField, FieldSubtypeCode } from "src/types/leadFields"; 
import { LeadFormText, LeadFormNumber, LeadFormSelect, LeadFormDate, LeadFormFile } from "src/features/lead/shared/LeadFormFields";
import SaveIcon from "@mui/icons-material/Save";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

// Mock lead fields for testing
const mockLeadFields: LeadField[] = [
    {
        id: 1,
        field_name: "company_name",
        field_label: "Razón Social",
        field_type_code: "TEXT",
        field_subtype_code: "TEXT" as FieldSubtypeCode,
        required: true,
        is_pii: false,
        order: 1,
        default_value: null,
        options: null,
        campaign: 1,
    },
    {
        id: 2,
        field_name: "cuit",
        field_label: "CUIT / CUIL",
        field_type_code: "TEXT",
        field_subtype_code: "TEXT" as FieldSubtypeCode,
        required: true,
        is_pii: false,
        order: 2,
        default_value: null,
        options: null,
        campaign: 1,
    },
    {
        id: 3,
        field_name: "company_type",
        field_label: "Tipo de Empresa",
        field_type_code: "SELECT",
        field_subtype_code: "SELECT" as FieldSubtypeCode,
        required: false,
        is_pii: false,
        order: 3,
        default_value: null,
        options: [
            { value: "startup", label: "Startup" },
            { value: "pyme", label: "PyME" },
            { value: "enterprise", label: "Enterprise" },
            { value: "gobierno", label: "Gobierno" },
        ],
        campaign: 1,
    },
    {
        id: 4,
        field_name: "employees",
        field_label: "Cantidad de Empleados",
        field_type_code: "NUMBER",
        field_subtype_code: "INTEGER" as FieldSubtypeCode,
        required: false,
        is_pii: false,
        order: 4,
        default_value: "0",
        options: null,
        campaign: 1,
    },
    {
        id: 5,
        field_name: "website",
        field_label: "Sitio Web",
        field_type_code: "TEXT",
        field_subtype_code: "URL" as FieldSubtypeCode,
        required: false,
        is_pii: false,
        order: 5,
        default_value: null,
        options: null,
        campaign: 1,
    },
    {
        id: 6,
        field_name: "contact_name",
        field_label: "Nombre del Contacto",
        field_type_code: "TEXT",
        field_subtype_code: "TEXT" as FieldSubtypeCode,
        required: true,
        is_pii: true,
        order: 6,
        default_value: null,
        options: null,
        campaign: 1,
    },
    {
        id: 7,
        field_name: "email",
        field_label: "Email",
        field_type_code: "TEXT",
        field_subtype_code: "EMAIL" as FieldSubtypeCode,
        required: true,
        is_pii: true,
        order: 7,
        default_value: null,
        options: null,
        campaign: 1,
    },
    {
        id: 8,
        field_name: "phone",
        field_label: "Teléfono",
        field_type_code: "TEXT",
        field_subtype_code: "PHONE" as FieldSubtypeCode,
        required: false,
        is_pii: true,
        order: 8,
        default_value: null,
        options: null,
        campaign: 1,
    },
    {
        id: 9,
        field_name: "next_meeting",
        field_label: "Próxima Reunión",
        field_type_code: "DATE",
        field_subtype_code: "DATE" as FieldSubtypeCode,
        required: false,
        is_pii: false,
        order: 9,
        default_value: null,
        options: null,
        campaign: 1,
    },
    {
        id: 10,
        field_name: "profile_image",
        field_label: "Foto de Perfil",
        field_type_code: "FILE",
        field_subtype_code: "FILE_IMAGE" as FieldSubtypeCode,
        required: false,
        is_pii: false,
        order: 10,
        default_value: null,
        options: null,
        campaign: 1,
    },
    {
        id: 11,
        field_name: "proposal_doc",
        field_label: "Propuesta Comercial",
        field_type_code: "FILE",
        field_subtype_code: "FILE_DOCUMENT" as FieldSubtypeCode,
        required: false,
        is_pii: false,
        order: 11,
        default_value: null,
        options: null,
        campaign: 1,
    },
    {
        id: 12,
        field_name: "notes",
        field_label: "Notas Internas",
        field_type_code: "TEXT",
        field_subtype_code: "TEXTAREA" as FieldSubtypeCode,
        required: false,
        is_pii: false,
        order: 12,
        default_value: null,
        options: null,
        campaign: 1,
    },
];

interface FormData {
    company_name: string;
    cuit: string;
    company_type: string;
    employees: number;
    website: string;
    contact_name: string;
    email: string;
    phone: string;
    next_meeting: string;
    profile_image: File | null;
    proposal_doc: File | null;
    notes: string;
}

export const FormTestPage = () => {
    const { register, control, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
        defaultValues: {
            company_name: "",
            cuit: "",
            company_type: "",
            employees: 0,
            website: "",
            contact_name: "",
            email: "",
            phone: "",
            next_meeting: "",
            profile_image: null,
            proposal_doc: null,
            notes: "",
        }
    });

    const onSubmit = (data: FormData) => {
        console.log("Form submitted:", data);
        alert("Formulario enviado! Revisa la consola para ver los datos.");
    };

    const renderField = (field: LeadField) => {
        const name = field.field_name as keyof FormData;
        const errorMessage = errors[name]?.message;

        switch (field.field_type_code) {
            case "TEXT":
                return (
                    <LeadFormText
                        key={field.id}
                        register={register}
                        name={name}
                        label={field.field_label}
                        required={field.required}
                        errorMessage={errorMessage}
                        multiline={field.field_subtype_code === "TEXTAREA"}
                    />
                );
            case "NUMBER":
                return (
                    <LeadFormNumber
                        key={field.id}
                        control={control}
                        name={name}
                        label={field.field_label}
                        required={field.required}
                        errorMessage={errorMessage}
                    />
                );
            case "SELECT":
                return (
                    <LeadFormSelect
                        key={field.id}
                        control={control}
                        name={name}
                        label={field.field_label}
                        required={field.required}
                        errorMessage={errorMessage}
                        options={field.options?.map(opt => ({ value: opt.value, label: opt.label })) || []}
                    />
                );
            case "DATE":
                return (
                    <LeadFormDate
                        key={field.id}
                        control={control}
                        name={name}
                        label={field.field_label}
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
                        label={field.field_label}
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
