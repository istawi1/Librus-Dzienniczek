import {
  Box,
  Badge,
  Button,
  Card,
  Container,
  Divider,
  Group,
  Loader,
  ActionIcon,
  ThemeIcon,
  Paper,
  Progress,
  SimpleGrid,
  Stack,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconCalendar,
  IconClipboardList,
  IconCode,
  IconDeviceLaptop,
  IconFlask,
  IconLanguage,
  IconMinus,
  IconMathFunction,
  IconNotebook,
  IconPlus,
  IconStars,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchGrades } from "../api/client";
import { useAuth } from "../context/AuthContext";
import AppShellLayout from "../components/Layout/AppShellLayout";

const gradeColor = (value) => {
  const parsed = parseFloat(value);
  if (Number.isNaN(parsed)) return "gray";
  if (parsed >= 5.5) return "teal";
  if (parsed >= 4.5) return "indigo";
  if (parsed >= 3.5) return "blue";
  if (parsed >= 2.5) return "yellow";
  return "red";
};

const safeAverage = (value) => {
  const numeric = typeof value === "string" ? parseFloat(value) : value;
  return Number.isFinite(numeric) ? numeric.toFixed(2) : "—";
};

const GradesPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { sessionId, user, logout } = useAuth();
  const [openSubjects, setOpenSubjects] = useState({});

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["grades", sessionId],
    queryFn: () => fetchGrades(sessionId),
    enabled: Boolean(sessionId),
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (error?.response?.status === 401) {
      notifications.show({
        title: "Sesja wygasła",
        message: "Zaloguj się ponownie, aby pobrać oceny.",
        color: "orange",
      });
      logout();
      navigate("/login");
    }
  }, [error, logout, navigate]);

  const student = data?.student || user?.student;
  const grades = data?.grades || [];
  const navItems = [
    { label: "Plan", path: "/plan", icon: <IconCalendar size={16} /> },
    { label: "Oceny", path: "/grades", icon: <IconClipboardList size={16} /> },
  ];

  const overallAverage = useMemo(() => {
    const allValues = [];
    grades.forEach((subject) => {
      if (Number.isFinite(subject?.average)) allValues.push(subject.average);
      subject?.semester?.forEach((sem) => {
        if (Number.isFinite(sem?.average)) allValues.push(sem.average);
      });
    });
    if (!allValues.length) return null;
    const sum = allValues.reduce((acc, val) => acc + val, 0);
    return sum / allValues.length;
  }, [grades]);

  const renderGrades = (collection = []) => {
    if (!collection.length) {
      return (
        <Text size="sm" c="dimmed">
          Brak ocen
        </Text>
      );
    }

    return (
      <Group gap="xs">
        {collection.map((grade) => (
          <Tooltip
            key={grade.id}
            withArrow
            color="dark"
            radius="md"
            label={
              <Box>
                <Text fw={600} size="sm">
                  {grade.value}
                </Text>
                <Text size="xs" style={{ whiteSpace: "pre-wrap" }}>
                  {grade.info}
                </Text>
              </Box>
            }
          >
            <Badge size="md" color={gradeColor(grade.value)} radius="sm" variant="light">
              {grade.value}
            </Badge>
          </Tooltip>
        ))}
      </Group>
    );
  };

const semesterAverage = (sem) => {
  const avg = typeof sem?.average === "string" ? parseFloat(sem.average) : sem?.average;
  const temp = typeof sem?.tempAverage === "string" ? parseFloat(sem.tempAverage) : sem?.tempAverage;
  const gradesCount = Array.isArray(sem?.grades) ? sem.grades.length : 0;
  if (!gradesCount) return null;
  if (Number.isFinite(avg)) return avg;
  if (Number.isFinite(temp)) return temp;
  return null;
};

const hasSemesterData = (sem) => {
  if (!sem) return false;
  const avg = typeof sem?.average === "string" ? parseFloat(sem.average) : sem?.average;
  const hasGrades = Array.isArray(sem?.grades) && sem.grades.length > 0;
  return hasGrades || Number.isFinite(avg);
};

const subjectHasData = (subject) =>
  (subject.semester || []).some(
    (sem) =>
      sem &&
      ((Array.isArray(sem.grades) && sem.grades.length > 0) ||
        Number.isFinite(typeof sem.average === "string" ? parseFloat(sem.average) : sem.average))
  );

const subjectIcon = (name = "") => {
  const n = name.toLowerCase();
  if (n.includes("matematy")) return <IconMathFunction size={16} />;
  if (n.includes("fizy") || n.includes("chem")) return <IconFlask size={16} />;
  if (n.includes("program") || n.includes("informat") || n.includes("komputer"))
    return <IconDeviceLaptop size={16} />;
  if (n.includes("język") || n.includes("angiel") || n.includes("niemieck") || n.includes("polski"))
    return <IconLanguage size={16} />;
  if (n.includes("systemy") || n.includes("operacy")) return <IconCode size={16} />;
  return <IconNotebook size={16} />;
};

  const sortedGrades = [...grades].sort((a, b) => {
    const aHasData = subjectHasData(a);
    const bHasData = subjectHasData(b);
    if (aHasData === bHasData) return 0;
    return aHasData ? -1 : 1;
  });

  return (
    <AppShellLayout
      student={student}
      onLogout={() => {
        logout();
        navigate("/login");
      }}
      onRefresh={() => refetch()}
      loading={isFetching}
      navItems={navItems}
      currentPath={location.pathname}
      onNavigate={(path) => navigate(path)}
    >
      <Container size="lg" py="md">
        <Stack gap="md">
          <Paper p="lg" radius="lg" shadow="sm" withBorder bg="var(--mantine-color-dark-6)">
            <Group justify="space-between" align="center">
              <div>
                <Text size="sm" c="gray.4">
                  Librus API • Librus Synergia
                </Text>
                <Title order={2}>Panel ocen</Title>
              </div>

              <Paper withBorder radius="md" p="md" bg="var(--mantine-color-dark-5)">
                <Group align="center" gap="sm">
                  <IconStars size={22} color="#91a4ff" />
                  <div>
                    <Text size="xs" c="gray.4">
                      Średnia łączna
                    </Text>
                    <Text fw={700} size="lg">
                      {overallAverage ? overallAverage.toFixed(2) : "—"}
                    </Text>
                  </div>
                </Group>
              </Paper>
            </Group>
          </Paper>

          {isLoading ? (
            <Group justify="center" mt="lg">
              <Loader size="lg" />
            </Group>
          ) : error ? (
            <Paper withBorder p="lg" radius="md">
              <Stack gap="xs" align="center">
                <Text fw={600}>Nie udało się pobrać ocen</Text>
                <Text c="dimmed" size="sm">
                  {error?.response?.data?.message || "Spróbuj ponownie."}
                </Text>
                <Button variant="light" onClick={() => refetch()}>
                  Spróbuj ponownie
                </Button>
              </Stack>
            </Paper>
          ) : sortedGrades.length ? (
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
              {sortedGrades.map((subject) => (
                <Card
                  key={subject.name}
                  shadow="sm"
                  radius="md"
                  withBorder
                  bg="var(--mantine-color-dark-6)"
                  styles={{ section: { backgroundColor: "transparent" } }}
                >
                <Group justify="space-between" align="flex-start" mb="xs">
                  <Group gap="sm" align="flex-start">
                    <ThemeIcon variant="light" color="indigo" radius="md">
                      {subjectIcon(subject.name)}
                    </ThemeIcon>
                    <div>
                      <Text fw={700}>{subject.name}</Text>
                      <Text size="sm" c="gray.4">
                        Średnia: {subjectHasData(subject) ? safeAverage(subject.average) : "—"} | Proponowana:{" "}
                        {subjectHasData(subject) ? safeAverage(subject.tempAverage) : "—"}
                      </Text>
                    </div>
                  </Group>
                  <Group gap="xs">
                    <Badge color="indigo" variant="light">
                      {subjectHasData(subject) ? safeAverage(subject.average) : "—"}
                    </Badge>
                    <ActionIcon
                      variant="subtle"
                      color="gray"
                      onClick={() =>
                        setOpenSubjects((prev) => ({
                          ...prev,
                          [subject.name]:
                            prev[subject.name] !== undefined
                              ? !prev[subject.name]
                              : !subjectHasData(subject) ? false : true,
                        }))
                      }
                      aria-label="Przełącz widoczność semestrów"
                    >
                      {openSubjects[subject.name] === false ? <IconPlus size={16} /> : <IconMinus size={16} />}
                    </ActionIcon>
                  </Group>
                </Group>

                <Stack gap="xs">
                  {(() => {
                    const filtered = (subject.semester || []).filter((sem) => hasSemesterData(sem)).slice(0, 2);
                    const isOpen =
                      openSubjects[subject.name] !== undefined
                        ? openSubjects[subject.name]
                        : subjectHasData(subject);

                    if (!filtered.length) {
                      return (
                        <Paper withBorder radius="md" p="sm" bg="var(--mantine-color-dark-5)">
                          <Text size="sm" c="gray.4">
                            Brak ocen w tym przedmiocie
                          </Text>
                        </Paper>
                      );
                    }

                    if (!isOpen) return null;

                    return filtered.map((sem, index) => {
                      const semAvg = semesterAverage(sem);
                      return (
                        <Paper
                          key={`${subject.name}-sem-${index}`}
                          p="sm"
                          radius="md"
                          withBorder
                          bg="var(--mantine-color-dark-5)"
                        >
                          <Group justify="space-between" align="center">
                            <Group gap="xs">
                              <Badge variant="outline" color="indigo">
                                Semestr {index + 1}
                              </Badge>
                              <Text size="sm" c="gray.4">
                                Śr. {safeAverage(semAvg)}
                              </Text>
                            </Group>
                            <Group gap="xs" wrap="nowrap">
                              <Text size="xs" c="gray.4">
                                Proponowana: {safeAverage(sem?.tempAverage)}
                              </Text>
                              <Progress
                                value={
                                  Number.isFinite(semAvg) ? Math.min(100, (semAvg / 6) * 100) : 0
                                }
                                color="indigo"
                                size="sm"
                                w={120}
                              />
                            </Group>
                          </Group>
                          <Group mt="xs" gap="xs">
                            {renderGrades(sem?.grades || [])}
                          </Group>
                        </Paper>
                      );
                    });
                  })()}
                </Stack>
              </Card>
            ))}
          </SimpleGrid>
          ) : (
            <Paper withBorder p="lg" radius="md">
              <Stack gap="xs" align="center">
                <Text fw={600}>Brak ocen do wyświetlenia</Text>
                <Text c="dimmed" size="sm">
                  Po zalogowaniu pobierz oceny, aby zobaczyć listę przedmiotów.
                </Text>
              </Stack>
            </Paper>
          )}
        </Stack>
      </Container>
    </AppShellLayout>
  );
};

export default GradesPage;
