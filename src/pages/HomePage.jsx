import React, { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import WorkIcon from "@mui/icons-material/Work";
import BusinessIcon from "@mui/icons-material/Business";
import PersonIcon from "@mui/icons-material/Person";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import VerifiedIcon from "@mui/icons-material/Verified";
import BoltIcon from "@mui/icons-material/Bolt";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import GroupsIcon from "@mui/icons-material/Groups";
import StarIcon from "@mui/icons-material/Star";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { getPublicJobs } from '../api/jobs';
import { useNavigate } from "react-router-dom";
import { getPublicCompanies } from "../api/company";

export default function HomePage() {
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    q: "",
    location: "",
  });

  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({
    jobs: 0,
    companies: 0,
    candidates: 0,
  });

  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    loadJobs();
    loadCompanies();
  }, []);


  const loadCompanies = async () => {
  try {
    const rows = await getPublicCompanies();
    setCompanies(Array.isArray(rows) ? rows : []);
  } catch (error) {
    console.error("Error cargando empresas:", error);
    setCompanies([]);
  }
};

  const loadJobs = async () => {
  try {
    const rows = await getPublicJobs();

    setJobs(Array.isArray(rows) ? rows.slice(0, 3) : []);

    setStats({
      jobs: Array.isArray(rows) ? rows.length : 0,
      companies: 120,
      candidates: 500,
    });
  } catch (error) {
    console.error("Error cargando vacantes:", error);

     setStats({
      jobs: 25,
      companies: 120,
      candidates: 500,
    });
  }
};

  const handleSearch = () => {
    const params = new URLSearchParams();

    if (filters.q.trim()) params.set("q", filters.q.trim());
    if (filters.location.trim()) params.set("location", filters.location.trim());

    navigate(`/jobs?${params.toString()}`);
  };

  return (
    <Box sx={{ bgcolor: "#f6f8fc", minHeight: "100vh" }}>
      <Hero
        filters={filters}
        setFilters={setFilters}
        handleSearch={handleSearch}
        jobs={jobs}
        stats={stats}
        navigate={navigate}
      />

      <Benefits />

      <HowItWorks />

      <CandidatesAndCompanies navigate={navigate} />

      <FeaturedCompanies />

      <Plans navigate={navigate} />

      <FinalCTA navigate={navigate} />

      <Footer navigate={navigate} />

      <WhatsAppFloating />
    </Box>
  );
}

function Hero({ filters, setFilters, handleSearch, jobs, stats, navigate }) {
  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        background:
          "linear-gradient(135deg, #071a52 0%, #123c8c 45%, #1976d2 100%)",
        color: "white",
        pt: { xs: 7, md: 10 },
        pb: { xs: 10, md: 14 },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          width: 430,
          height: 430,
          borderRadius: "50%",
          bgcolor: "rgba(255,255,255,0.08)",
          top: -140,
          right: -120,
        }}
      />

      <Box
        sx={{
          position: "absolute",
          width: 260,
          height: 260,
          borderRadius: "50%",
          bgcolor: "rgba(255,255,255,0.06)",
          bottom: -90,
          left: -70,
        }}
      />

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 2 }}>
        <Grid container spacing={5} alignItems="center">
          <Grid item xs={12} md={7}>
            <Stack spacing={3}>
              <Chip
                icon={<BoltIcon />}
                label="La forma más rápida de conectar talento con empresas"
                sx={chipHeroStyle}
              />

              <Typography
                variant="h2"
                fontWeight={900}
                sx={{
                  fontSize: { xs: 38, md: 62 },
                  lineHeight: 1.05,
                  letterSpacing: "-1px",
                }}
              >
                Encuentra el trabajo ideal o al candidato perfecto
              </Typography>

              <Typography
                variant="h6"
                sx={{
                  color: "rgba(255,255,255,0.86)",
                  maxWidth: 650,
                  lineHeight: 1.7,
                }}
              >
                Una plataforma moderna para publicar vacantes, descubrir talento,
                aplicar fácilmente y conectar oportunidades reales con personas
                preparadas.
              </Typography>

              <Paper
                elevation={8}
                sx={{
                  p: { xs: 2, md: 2.5 },
                  borderRadius: 4,
                  bgcolor: "white",
                  mt: 2,
                }}
              >
                <Grid container spacing={2}>
                  <Grid item xs={12} md={5}>
                    <TextField
                      fullWidth
                      placeholder="Cargo, empresa o palabra clave"
                      value={filters.q}
                      onChange={(e) =>
                        setFilters({ ...filters, q: e.target.value })
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSearch();
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      placeholder="Ciudad o ubicación"
                      value={filters.location}
                      onChange={(e) =>
                        setFilters({ ...filters, location: e.target.value })
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSearch();
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LocationOnIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <Button
                      fullWidth
                      size="large"
                      variant="contained"
                      onClick={handleSearch}
                      sx={{
                        height: "100%",
                        minHeight: 56,
                        borderRadius: 3,
                        fontWeight: 900,
                        textTransform: "none",
                      }}
                    >
                      Buscar empleos
                    </Button>
                  </Grid>
                </Grid>
              </Paper>

              <Stack direction="row" spacing={2} flexWrap="wrap">
                <Chip label={`+${stats.candidates} candidatos`} sx={chipHeroStyle} />
                <Chip label={`+${stats.companies} empresas`} sx={chipHeroStyle} />
                <Chip label={`+${stats.jobs} vacantes activas`} sx={chipHeroStyle} />
              </Stack>
            </Stack>
          </Grid>

          <Grid item xs={12} md={5}>
            <Paper
              elevation={10}
              sx={{
                p: 3,
                borderRadius: 5,
                bgcolor: "rgba(255,255,255,0.96)",
                color: "text.primary",
              }}
            >
              <Stack spacing={2}>
                <Typography variant="h5" fontWeight={900}>
                  Vacantes destacadas
                </Typography>

                {jobs.map((job, index) => (
                  <Paper
                    key={job.id || index}
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      transition: "0.2s",
                      cursor: "pointer",
                      "&:hover": {
                        transform: "translateY(-3px)",
                        boxShadow: 4,
                      },
                    }}
                    onClick={() =>
                      job.id ? navigate(`/jobs/${job.id}`) : navigate("/jobs")
                    }
                  >
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ bgcolor: "primary.main" }}>
                        <WorkIcon />
                      </Avatar>

                      <Box sx={{ flex: 1 }}>
                        <Typography fontWeight={900}>{job.title}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {job.company_name || job.company || "Empresa"}
                        </Typography>

                        <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
                          <Chip
                            size="small"
                            label={job.location || "Nicaragua"}
                          />
                          <Chip
                            size="small"
                            color="primary"
                            variant="outlined"
                            label={job.modality || "Disponible"}
                          />
                        </Stack>
                      </Box>
                    </Stack>
                  </Paper>
                ))}

                <Button
                  variant="outlined"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate("/jobs")}
                  sx={{
                    borderRadius: 3,
                    textTransform: "none",
                    fontWeight: 900,
                  }}
                >
                  Ver todas las vacantes
                </Button>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

function Benefits() {
  const items = [
    {
      icon: <VerifiedIcon />,
      title: "Perfiles confiables",
      text: "Información clara para evaluar mejor a cada candidato.",
    },
    {
      icon: <TrendingUpIcon />,
      title: "Mejor visibilidad",
      text: "Las vacantes llegan a personas realmente interesadas.",
    },
    {
      icon: <GroupsIcon />,
      title: "Conexión rápida",
      text: "Empresas y candidatos se encuentran de forma simple.",
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: -6, position: "relative", zIndex: 4 }}>
      <Grid container spacing={3}>
        {items.map((item, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card
              elevation={4}
              sx={{
                borderRadius: 5,
                height: "100%",
                transition: "0.2s",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: 8,
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Avatar
                  sx={{
                    bgcolor: "primary.main",
                    width: 54,
                    height: 54,
                    mb: 2,
                  }}
                >
                  {item.icon}
                </Avatar>

                <Typography variant="h6" fontWeight={900}>
                  {item.title}
                </Typography>

                <Typography color="text.secondary" sx={{ mt: 1 }}>
                  {item.text}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Crea tu perfil",
      text: "Regístrate como candidato o empresa y completa tu información principal.",
    },
    {
      number: "02",
      title: "Conecta con oportunidades",
      text: "Busca empleos, publica vacantes o revisa candidatos compatibles.",
    },
    {
      number: "03",
      title: "Da el siguiente paso",
      text: "Aplica, contacta, entrevista y encuentra la mejor oportunidad.",
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Stack alignItems="center" textAlign="center" spacing={1} mb={5}>
        <Typography variant="h4" fontWeight={900}>
          ¿Cómo funciona?
        </Typography>
        <Typography color="text.secondary" sx={{ maxWidth: 620 }}>
          Diseñada para que cualquier persona pueda usarla sin complicaciones.
        </Typography>
      </Stack>

      <Grid container spacing={3}>
        {steps.map((step) => (
          <Grid item xs={12} md={4} key={step.number}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 5,
                border: "1px solid #e5eaf2",
                height: "100%",
                bgcolor: "white",
              }}
            >
              <Typography
                variant="h3"
                fontWeight={900}
                sx={{ color: "primary.main", opacity: 0.25 }}
              >
                {step.number}
              </Typography>

              <Typography variant="h6" fontWeight={900} sx={{ mt: 1 }}>
                {step.title}
              </Typography>

              <Typography color="text.secondary" sx={{ mt: 1.5, lineHeight: 1.8 }}>
                {step.text}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

function CandidatesAndCompanies({ navigate }) {
  return (
    <Container maxWidth="lg" sx={{ pb: 8 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <AudienceCard
            icon={<PersonIcon />}
            color="primary"
            title="Para candidatos"
            text="Crea tu perfil, aplica a vacantes y deja que las empresas vean tus habilidades, experiencia y fortalezas."
            benefits={[
              "Buscar empleos por cargo, ubicación o modalidad",
              "Aplicar rápido a vacantes disponibles",
              "Mostrar tu experiencia y habilidades",
            ]}
            button="Crear mi perfil"
            onClick={() => navigate("/register")}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <AudienceCard
            icon={<BusinessIcon />}
            color="success"
            title="Para empresas"
            text="Publica vacantes, recibe postulantes y encuentra candidatos con datos útiles para tomar mejores decisiones."
            benefits={[
              "Publicar vacantes profesionales",
              "Filtrar candidatos por experiencia y perfil",
              "Ver indicadores importantes del candidato",
            ]}
            button="Registrar mi empresa"
            onClick={() => navigate("/register")}
          />
        </Grid>
      </Grid>
    </Container>
  );
}

function AudienceCard({ icon, color, title, text, benefits, button, onClick }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 3, md: 5 },
        borderRadius: 5,
        height: "100%",
        border: "1px solid #e5eaf2",
        bgcolor: "white",
      }}
    >
      <Avatar
        sx={{
          bgcolor: color === "success" ? "#e8f5e9" : "#e3f2fd",
          color: `${color}.main`,
          mb: 2,
        }}
      >
        {icon}
      </Avatar>

      <Typography variant="h4" fontWeight={900}>
        {title}
      </Typography>

      <Typography color="text.secondary" sx={{ mt: 2, lineHeight: 1.8 }}>
        {text}
      </Typography>

      <Stack spacing={1.5} sx={{ mt: 3 }}>
        {benefits.map((item) => (
          <Benefit key={item} text={item} />
        ))}
      </Stack>

      <Button
        size="large"
        variant="contained"
        color={color}
        onClick={onClick}
        sx={{
          mt: 4,
          borderRadius: 3,
          textTransform: "none",
          fontWeight: 900,
        }}
      >
        {button}
      </Button>
    </Paper>
  );
}

function FeaturedCompanies({ companies = [] }) {
  if (!companies.length) return null;

  return (
    <Box sx={{ bgcolor: "white", py: 7 }}>
      <Container maxWidth="lg">
        <Stack alignItems="center" textAlign="center" spacing={1} mb={4}>
          <Typography variant="h4" fontWeight={900}>
            Empresas que confían en la plataforma
          </Typography>
          <Typography color="text.secondary">
            Conoce algunas empresas que publican oportunidades.
          </Typography>
        </Stack>

        <Grid container spacing={2} justifyContent="center">
          {companies.map((company) => (
            <Grid item xs={12} sm={6} md={2.4} key={company.id}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 4,
                  textAlign: "center",
                  height: "100%",
                  bgcolor: "white",
                }}
              >
                <Avatar
                  src={company.logo_url || ""}
                  sx={{
                    mx: "auto",
                    mb: 1,
                    bgcolor: "primary.main",
                    width: 56,
                    height: 56,
                    fontWeight: 900,
                  }}
                >
                  {company.name?.charAt(0)}
                </Avatar>

                <Typography fontWeight={900} noWrap>
                  {company.name}
                </Typography>

                {company.location && (
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {company.location}
                  </Typography>
                )}
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

function Plans({ navigate }) {
  const plans = [
    {
      name: "Candidatos",
      price: "Gratis",
      features: ["Crear perfil", "Buscar vacantes", "Aplicar a empleos"],
      button: "Registrarme",
      action: () => navigate("/register"),
    },
    {
      name: "Empresas",
      price: "Planes flexibles",
      features: ["Publicar vacantes", "Ver postulantes", "Filtrar candidatos"],
      button: "Publicar vacante",
      action: () => navigate("/register"),
      highlighted: true,
    },
    {
      name: "Premium",
      price: "Para crecer",
      features: ["Más visibilidad", "Candidatos destacados", "Soporte comercial"],
      button: "Hablar con ventas",
      action: () => window.open("https://wa.me/50588888888", "_blank"),
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Stack alignItems="center" textAlign="center" spacing={1} mb={5}>
        <Typography variant="h4" fontWeight={900}>
          Opciones para cada necesidad
        </Typography>
        <Typography color="text.secondary">
          Ideal para candidatos, empresas pequeñas y compañías en crecimiento.
        </Typography>
      </Stack>

      <Grid container spacing={3}>
        {plans.map((plan) => (
          <Grid item xs={12} md={4} key={plan.name}>
            <Paper
              elevation={plan.highlighted ? 8 : 0}
              sx={{
                p: 4,
                borderRadius: 5,
                height: "100%",
                border: plan.highlighted
                  ? "2px solid #1976d2"
                  : "1px solid #e5eaf2",
                bgcolor: "white",
                position: "relative",
              }}
            >
              {plan.highlighted && (
                <Chip
                  label="Recomendado"
                  color="primary"
                  sx={{
                    position: "absolute",
                    top: 16,
                    right: 16,
                    fontWeight: 800,
                  }}
                />
              )}

              <Typography variant="h5" fontWeight={900}>
                {plan.name}
              </Typography>

              <Typography
                variant="h4"
                fontWeight={900}
                sx={{ mt: 2, color: "primary.main" }}
              >
                {plan.price}
              </Typography>

              <Divider sx={{ my: 3 }} />

              <Stack spacing={1.5}>
                {plan.features.map((feature) => (
                  <Benefit key={feature} text={feature} />
                ))}
              </Stack>

              <Button
                fullWidth
                variant={plan.highlighted ? "contained" : "outlined"}
                onClick={plan.action}
                sx={{
                  mt: 4,
                  borderRadius: 3,
                  textTransform: "none",
                  fontWeight: 900,
                }}
              >
                {plan.button}
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

function FinalCTA({ navigate }) {
  return (
    <Box sx={{ bgcolor: "white", py: 8 }}>
      <Container maxWidth="md">
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 6 },
            borderRadius: 6,
            textAlign: "center",
            background:
              "linear-gradient(135deg, rgba(25,118,210,0.10), rgba(7,26,82,0.06))",
            border: "1px solid #dce7f8",
          }}
        >
          <Stack alignItems="center" spacing={2}>
            <Avatar sx={{ bgcolor: "warning.main", width: 60, height: 60 }}>
              <StarIcon />
            </Avatar>

            <Typography variant="h3" fontWeight={900}>
              Tu próximo paso profesional empieza aquí
            </Typography>

            <Typography color="text.secondary" sx={{ maxWidth: 650, lineHeight: 1.8 }}>
              Una experiencia simple, bonita y confiable para que candidatos y
              empresas quieran volver, recomendarla y usarla todos los días.
            </Typography>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mt={2}>
              <Button
                size="large"
                variant="contained"
                onClick={() => navigate("/jobs")}
                sx={{
                  borderRadius: 3,
                  textTransform: "none",
                  fontWeight: 900,
                  px: 4,
                }}
              >
                Explorar vacantes
              </Button>

              <Button
                size="large"
                variant="outlined"
                onClick={() => navigate("/login")}
                sx={{
                  borderRadius: 3,
                  textTransform: "none",
                  fontWeight: 900,
                  px: 4,
                }}
              >
                Iniciar sesión
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}

function Footer({ navigate }) {
  return (
    <Box sx={{ bgcolor: "#071a52", color: "white", py: 5 }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={5}>
            <Typography variant="h5" fontWeight={900}>
              JobBoard SaaS
            </Typography>
            <Typography sx={{ mt: 1, color: "rgba(255,255,255,0.72)" }}>
              Conectando empresas y talento con una experiencia moderna,
              rápida y confiable.
            </Typography>
          </Grid>

          <Grid item xs={12} md={2}>
            <Typography fontWeight={900}>Plataforma</Typography>
            <FooterLink text="Vacantes" onClick={() => navigate("/jobs")} />
            <FooterLink text="Registro" onClick={() => navigate("/register")} />
            <FooterLink text="Login" onClick={() => navigate("/login")} />
          </Grid>

          <Grid item xs={12} md={2}>
            <Typography fontWeight={900}>Usuarios</Typography>
            <FooterLink text="Candidatos" onClick={() => navigate("/register")} />
            <FooterLink text="Empresas" onClick={() => navigate("/register")} />
            <FooterLink text="Planes" onClick={() => navigate("/plans")} />
          </Grid>

          <Grid item xs={12} md={3}>
            <Typography fontWeight={900}>Contacto</Typography>
            <Typography sx={{ mt: 1, color: "rgba(255,255,255,0.72)" }}>
              Managua, Nicaragua
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.72)" }}>
              soporte@jobboard.com
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderColor: "rgba(255,255,255,0.16)" }} />

        <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.65)" }}>
          © {new Date().getFullYear()} JobBoard SaaS. Todos los derechos reservados.
        </Typography>
      </Container>
    </Box>
  );
}

function Benefit({ text }) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="center">
      <CheckCircleIcon color="primary" fontSize="small" />
      <Typography fontWeight={700}>{text}</Typography>
    </Stack>
  );
}

function FooterLink({ text, onClick }) {
  return (
    <Typography
      onClick={onClick}
      sx={{
        mt: 1,
        color: "rgba(255,255,255,0.72)",
        cursor: "pointer",
        "&:hover": {
          color: "white",
          textDecoration: "underline",
        },
      }}
    >
      {text}
    </Typography>
  );
}

function WhatsAppFloating() {
  return (
    <IconButton
      onClick={() => window.open("https://wa.me/50588888888", "_blank")}
      sx={{
        position: "fixed",
        right: 22,
        bottom: 22,
        width: 58,
        height: 58,
        bgcolor: "#25D366",
        color: "white",
        zIndex: 99,
        boxShadow: 6,
        "&:hover": {
          bgcolor: "#1ebe5d",
          transform: "scale(1.06)",
        },
      }}
    >
      <WhatsAppIcon fontSize="large" />
    </IconButton>
  );
}

const chipHeroStyle = {
  width: "fit-content",
  bgcolor: "rgba(255,255,255,0.14)",
  color: "white",
  fontWeight: 800,
  border: "1px solid rgba(255,255,255,0.25)",
};