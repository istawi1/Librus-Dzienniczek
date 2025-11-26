import {
  Badge,
  Container,
  Group,
  Loader,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchTimetable } from "../api/client";
import AppShellLayout from "../components/Layout/AppShellLayout";
import { useAuth } from "../context/AuthContext";
import { IconCalendar, IconClipboardList } from "@tabler/icons-react";

const dayLabel = {
  Monday: "Poniedziałek",
  Tuesday: "Wtorek",
  Wednesday: "Środa",
  Thursday: "Czwartek",
  Friday: "Piątek",
  Saturday: "Sobota",
  Sunday: "Niedziela",
};

const remainingMinutes = (range) => {
  const match = range?.match(/(\d{2}):(\d{2})\s*-\s*(\d{2}):(\d{2})/);
  if (!match) return null;
  const [, sh, sm, eh, em] = match.map((v) => parseInt(v, 10));
  const now = new Date();
  const start = new Date(now);
  start.setHours(sh, sm, 0, 0);
  const end = new Date(now);
  end.setHours(eh, em, 0, 0);

  if (now >= start && now <= end) {
    return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / 60000));
  }
  return null;
};

const SchedulePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { sessionId, user, logout } = useAuth();

  const navItems = [
    { label: "Plan", path: "/plan", icon: <IconCalendar size={16} /> },
    { label: "Oceny", path: "/grades", icon: <IconClipboardList size={16} /> },
  ];

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["timetable", sessionId],
    queryFn: () => fetchTimetable(sessionId),
    enabled: Boolean(sessionId),
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (error?.response?.status === 401) {
      notifications.show({
        title: "Sesja wygasła",
        message: "Zaloguj się ponownie, aby zobaczyć plan lekcji.",
        color: "orange",
      });
      logout();
      navigate("/login");
    }
  }, [error, logout, navigate]);

  const timetable = data?.timetable || {};
  const hours = timetable.hours || [];
  const table = timetable.table || {};

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
          <Paper withBorder radius="lg" p="lg" shadow="sm" bg="var(--mantine-color-dark-6)">
            <Group justify="space-between" align="center">
              <div>
                <Text size="sm" c="gray.4">
                  Librus API • Librus Synergia
                </Text>
                <Title order={3}>Plan lekcji</Title>
              </div>
              <Badge color="indigo" variant="light">
                Bieżący tydzień
              </Badge>
            </Group>
          </Paper>

          {isLoading ? (
            <Group justify="center" mt="lg">
              <Loader size="lg" />
            </Group>
          ) : error ? (
            <Paper withBorder p="lg" radius="md">
              <Stack gap="xs" align="center">
                <Text fw={600}>Nie udało się pobrać planu lekcji</Text>
                <Text c="dimmed" size="sm">
                  {error?.response?.data?.message || "Spróbuj ponownie."}
                </Text>
                <Badge variant="light" color="indigo" onClick={() => refetch()} style={{ cursor: "pointer" }}>
                  Odśwież
                </Badge>
              </Stack>
            </Paper>
          ) : (
            <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="md">
              {Object.entries(table).map(([day, lessons]) => (
                <Paper key={day} withBorder radius="lg" p="md" shadow="sm" bg="var(--mantine-color-dark-6)">
                  <Group justify="space-between" align="center" mb="sm">
                    <Title order={4}>{dayLabel[day] || day}</Title>
                    <Text size="xs" c="gray.4">
                      {lessons?.filter(Boolean).length} lekcje
                    </Text>
                  </Group>
                  <Stack gap="xs">
                    {lessons?.map((lesson, idx) => {
                      const hour = hours[idx] || "";
                      const minutesLeft = remainingMinutes(hour);
                      if (!lesson) {
                        return (
                          <Group
                            key={`${day}-${idx}`}
                            justify="space-between"
                            bg="var(--mantine-color-dark-5)"
                            p="xs"
                            radius="md"
                          >
                            <div>
                              <Text size="sm" c="gray.4">
                                {hour}
                              </Text>
                              <Text size="sm" c="gray.4">
                                — przerwa —
                              </Text>
                            </div>
                            {minutesLeft !== null && (
                              <Badge size="sm" variant="light" color="indigo">
                                {minutesLeft} min do końca
                              </Badge>
                            )}
                          </Group>
                        );
                      }
                      return (
                        <Paper
                          key={`${day}-${idx}`}
                          withBorder
                          radius="md"
                          p="sm"
                          bg="var(--mantine-color-dark-5)"
                        >
                          <Group justify="space-between" align="center">
                            <div>
                              <Text fw={600}>{lesson.subject}</Text>
                              <Text size="xs" c="gray.4">
                                {lesson.teacher} {lesson.room ? `• sala ${lesson.room}` : ""}
                              </Text>
                            </div>
                            <Stack gap={4} align="flex-end">
                              <Badge variant="light" color="indigo">
                                {hour}
                              </Badge>
                              {minutesLeft !== null && (
                                <Badge size="sm" variant="outline" color="teal">
                                  {minutesLeft} min do końca
                                </Badge>
                              )}
                            </Stack>
                          </Group>
                        </Paper>
                      );
                    })}
                  </Stack>
                </Paper>
              ))}
            </SimpleGrid>
          )}
        </Stack>
      </Container>
    </AppShellLayout>
  );
};

export default SchedulePage;
