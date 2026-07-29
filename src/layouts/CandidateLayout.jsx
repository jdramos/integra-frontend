import React from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Container,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import PersonIcon from "@mui/icons-material/Person";
import WorkIcon from "@mui/icons-material/Work";
import AssignmentIcon from "@mui/icons-material/Assignment";
import LogoutIcon from "@mui/icons-material/Logout";

const drawerWidth = 270;

const menu = [
  {
    text: "Inicio",
    icon: <DashboardIcon />,
    path: "/candidate",
  },
  {
    text: "Mi perfil",
    icon: <PersonIcon />,
    path: "/candidate/profile",
  },
  {
    text: "Buscar empleos",
    icon: <WorkIcon />,
    path: "/candidate/jobs",
  },
  {
    text: "Mis postulaciones",
    icon: <AssignmentIcon />,
    path: "/candidate/applications",
  },
];

export default function CandidateLayout() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("jobboard_user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("jobboard_token");
    localStorage.removeItem("jobboard_user");
    navigate("/login");
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f5f7fb" }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: "#fff",
          color: "#111827",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <Toolbar>
          <Typography variant="h6" fontWeight={900} sx={{ color: "primary.main" }}>
            Integra RH
          </Typography>

          <Box sx={{ flexGrow: 1 }} />

          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar sx={{ width: 36, height: 36, bgcolor: "primary.main" }}>
              {user?.name?.charAt(0) || user?.email?.charAt(0) || "C"}
            </Avatar>

            <Box sx={{ display: { xs: "none", sm: "block" } }}>
              <Typography fontWeight={800} fontSize={14}>
                {user?.name || "Candidato"}
              </Typography>
              <Typography color="text.secondary" fontSize={12}>
                {user?.email || "Panel de candidato"}
              </Typography>
            </Box>

            <Button
              size="small"
              color="error"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
            >
              Salir
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          display: { xs: "none", md: "block" },
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
            borderRight: "1px solid #e5e7eb",
            bgcolor: "#ffffff",
          },
        }}
      >
        <Toolbar />

        <Box sx={{ p: 2 }}>
          <PaperProfileCard user={user} />

          <Divider sx={{ my: 2 }} />

          <List sx={{ display: "grid", gap: 0.7 }}>
            {menu.map((item) => (
              <ListItemButton
                key={item.path}
                component={NavLink}
                to={item.path}
                end={item.path === "/candidate"}
                sx={{
                  borderRadius: 3,
                  "&.active": {
                    bgcolor: "primary.main",
                    color: "#fff",
                    "& .MuiListItemIcon-root": {
                      color: "#fff",
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 38 }}>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{ fontWeight: 800, fontSize: 14 }}
                />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, width: "100%" }}>
        <Toolbar />

        <Container maxWidth="xl" sx={{ py: 3 }}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
}

function PaperProfileCard({ user }) {
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 4,
        background: "linear-gradient(135deg, #0057B8 0%, #003E8A 100%)",
        color: "#fff",
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Avatar sx={{ bgcolor: "#fff", color: "primary.main", fontWeight: 900 }}>
          {user?.name?.charAt(0) || user?.email?.charAt(0) || "C"}
        </Avatar>

        <Box>
          <Typography fontWeight={900}>
            {user?.name || "Candidato"}
          </Typography>
          <Typography fontSize={12} sx={{ opacity: 0.85 }}>
            Panel profesional
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}