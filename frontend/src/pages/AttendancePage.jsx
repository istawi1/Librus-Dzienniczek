import {
  Badge,
  Button,
  Container,
  Grid,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchAttendance } from "../api/client";
import AppShellLayout from "../components/Layout/AppShellLayout";
import { useAuth } from "../context/AuthContext";
import { IconCalendar, IconClipboardList, IconUserCheck } from "@tabler/icons-react";

const typeColor = (type = "") => {
  const key = type.toLowerCase();
  if (key.includes("nieobec") || key.includes("nb")) return "red";
  if (key.includes("spóź") || key.includes("spoz")) return "orange";
  if (key.includes("zwoln")) return "yellow";
  if (key.includes("obec")) return "teal";
  return "gray";
};

const flattenEntries = (semesters) =>
  semesters.flatMap((sem) => sem.list || []).flatMap((row) => row?.table?.filter(Boolean) || []);

const isAbsentType = (type = "") => {
  const key = type.toLowerCase();
  return key.includes("nb") || key.includes("nieobec") || key.includes("spóź") || key.includes("spoz");
};

const attendanceStats = (semesters) => {
  const entries = flattenEntries(semesters);
  const total = entries.length;
  const perType = {};
  entries.forEach((entry) => {
    const key = entry.type || "inne";
    perType[key] = (perType[key] || 0) + 1;
  });
  const absentCount = entries.filter((entry) => isAbsentType(entry.type)).length;
  const presentPct = total ? Math.max(0, ((total - absentCount) / total) * 100) : null;
  return { total, perType, presentPct };
};

const AttendancePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { sessionId, user, logout } = useAuth();

  const navItems = [
    { label: "Plan", path: "/plan", icon: <IconCalendar size={16} /> },
    { label: "Oceny", path: "/grades", icon: <IconClipboardList size={16} /> },
    { label: "Frekwencja", path: "/frekwencja", icon: <IconUserCheck size={16} /> },
  ];

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["attendance", sessionId],
    queryFn: () => fetchAttendance(sessionId),
    enabled: Boolean(sessionId),
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (error?.response?.status === 401) {
      notifications.show({
        title: "Sesja wygasła",
        message: "Zaloguj się ponownie, aby zobaczyć frekwencję.",
        color: "orange",
      });
      logout();
      navigate("/login");
    }
  }, [error, logout, navigate]);

  const absences = data?.absences || {};
  const perSubject = data?.details?.perSubject || {};
  const semesters = useMemo(() => {
    return Object.entries(absences).map(([key, list], idx) => ({
      label: key === "0" ? "Semestr 1" : key === "1" ? "Semestr 2" : `Semestr ${idx + 1}`,
      list: list || [],
    }));
  }, [absences]);

  const totals = useMemo(() => {
    const { total, perType, presentPct } = attendanceStats(semesters);
    return { total, perType, presentPct };
  }, [semesters]);

  return (
    <AppShellLayout
      student={user?.student}
      onLogout={() => {
        logout();
        navigate("/login");
      }}
      onRefresh={() => refetch()}
      loading={isLoading}
      navItems={navItems}
      currentPath={location.pathname}
      onNavigate={(path) => navigate(path)}
    >
      <Container size="lg" py="md">
        <Stack gap="md">
          <Paper withBorder radius="lg" p="lg" shadow="sm">
            <Group justify="space-between" align="center">
              <div>
                <Text size="sm" c="dimmed">
                  Librus API • Librus Synergia
                </Text>
                <Title order={3}>Frekwencja</Title>
              </div>
              <Stack gap={4} align="flex-end">
                {totals.presentPct !== null && (
                  <Badge color="teal" variant="light">
                    Obecność: {totals.presentPct.toFixed(1)}%
                  </Badge>
                )}
                <Group gap="xs">
                  {Object.entries(totals.perType).map(([type, count]) => (
                    <Badge key={type} color={typeColor(type)} variant="light" radius="sm">
                      {type}: {count}
                    </Badge>
                  ))}
                </Group>
              </Stack>
            </Group>
          </Paper>

          {Object.keys(perSubject).length > 0 && (
            <Paper withBorder radius="lg" p="lg" shadow="sm" bg="var(--mantine-color-dark-6)">
              <Stack gap="sm">
                <Text fw={600}>Frekwencja per przedmiot</Text>
                <Grid>
                  {Object.entries(perSubject).map(([subject, info]) => {
                    const total = info?.total || 0;
                    const absent = Object.entries(info.perType || {}).reduce(
                      (acc, [type, count]) => (isAbsentType(type) ? acc + count : acc),
                      0
                    );
                    const presentPct = total ? Math.max(0, ((total - absent) / total) * 100) : null;

                    return (
                      <Grid.Col key={subject} span={{ base: 12, sm: 6, md: 4 }}>
                        <Paper withBorder radius="md" p="sm" bg="var(--mantine-color-dark-5)">
                          <Stack gap={6}>
                            <Group justify="space-between" align="center">
                              <Text fw={600} size="sm">
                                {subject}
                              </Text>
                              {presentPct !== null && (
                                <Badge color={presentPct >= 90 ? "teal" : "orange"} variant="light">
                                  {presentPct.toFixed(1)}%
                                </Badge>
                              )}
                            </Group>
                            <Group gap="xs">
                              {Object.entries(info.perType || {}).map(([type, count]) => (
                                <Badge key={type} color={typeColor(type)} variant="light" radius="sm">
                                  {type}: {count}
                                </Badge>
                              ))}
                            </Group>
                          </Stack>
                        </Paper>
                      </Grid.Col>
                    );
                  })}
                </Grid>
              </Stack>
            </Paper>
          )}

          {isLoading ? (
            <Group justify="center" mt="lg">
              <Loader size="lg" />
            </Group>
          ) : error ? (
            <Paper withBorder p="lg" radius="md">
              <Stack gap="xs" align="center">
                <Text fw={600}>Nie udało się pobrać frekwencji</Text>
                <Text c="dimmed" size="sm">
                  {error?.response?.data?.message || "Spróbuj ponownie."}
                </Text>
                <Button variant="light" onClick={() => refetch()}>
                  Spróbuj ponownie
                </Button>
              </Stack>
            </Paper>
          ) : (
            semesters.map((semester) => (
              <Paper key={semester.label} withBorder radius="lg" p="lg" shadow="sm">
                <Group justify="space-between" align="center" mb="sm">
                  <Title order={4}>{semester.label}</Title>
                  <Text size="sm" c="dimmed">
                    {semester.list.length} dni
                  </Text>
                </Group>
                <Stack gap="sm">
                  {semester.list.length === 0 ? (
                    <Text size="sm" c="dimmed">
                      Brak wpisów
                    </Text>
                  ) : (
                    semester.list.map((row, idx) => (
                      <Paper key={`${row.date}-${idx}`} withBorder radius="md" p="sm">
                        <Group justify="space-between" align="center">
                          <div>
                            <Text fw={600}>{row.date}</Text>
                            <Text size="xs" c="dimmed">
                              {row.info?.join(" • ")}
                            </Text>
                          </div>
                          <Group gap="xs" wrap="wrap" justify="flex-end">
                            {row.table
                              ?.filter(Boolean)
                              .map((cell, i) => (
                                <Badge key={`${cell.id}-${i}`} color={typeColor(cell.type)} variant="light">
                                  {cell.type}
                                </Badge>
                              ))}
                          </Group>
                        </Group>
                      </Paper>
                    ))
                  )}
                </Stack>
              </Paper>
            ))
          )}
        </Stack>
      </Container>
    </AppShellLayout>
  );
};

export default AttendancePage;
