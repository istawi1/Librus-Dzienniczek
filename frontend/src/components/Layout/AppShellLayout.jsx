import {
  ActionIcon,
  AppShell,
  Avatar,
  Badge,
  Button,
  Burger,
  Group,
  NavLink,
  Paper,
  Stack,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import { IconLogout, IconRefresh } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";

const AppShellLayout = ({
  student,
  onLogout,
  onRefresh,
  loading,
  navItems = [],
  currentPath,
  onNavigate,
  children,
}) => {
  const [opened, { toggle, close }] = useDisclosure(false);
  const initials =
    student?.nameSurname
      ?.split(" ")
      .map((p) => p[0])
      .join("")
      .toUpperCase() || "?";

  return (
    <AppShell
      header={{
        height: 72,
      }}
      navbar={{
        width: { base: 240, sm: 260 },
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      styles={{
        root: { backgroundColor: "var(--mantine-color-dark-8)" },
        main: { backgroundColor: "var(--mantine-color-dark-8)" },
        header: { backgroundColor: "var(--mantine-color-dark-7)" },
        navbar: { backgroundColor: "var(--mantine-color-dark-7)" },
      }}
      padding="lg"
    >
      <AppShell.Navbar p="md">

        <Stack gap="xs">
          {navItems.map((item) => {
            const active = currentPath === item.path;
            return (
              <NavLink
                key={item.path}
                label={item.label}
                leftSection={item.icon}
                active={active}
                variant="light"
                color="indigo"
                onClick={() => {
                  onNavigate?.(item.path);
                  close();
                }}
              />
            );
          })}
        </Stack>

        <Stack gap="sm" mt="auto" mb="sm">
          <Group gap="sm" align="flex-start" wrap="nowrap">
            <Avatar color="indigo" radius="md" size="md">
              {initials}
            </Avatar>
            <div>
              <Text fw={700} size="sm" c="gray.0">
                Dzienniczek Librus
              </Text>
              <Text size="xs" c="gray.4">
                {student?.nameSurname || "Uczeń"}
              </Text>
              {student?.class ? (
                <Badge size="sm" variant="light" color="indigo">
                  {student.class}
                </Badge>
              ) : null}
            </div>
          </Group>
          <Button variant="light" color="red" leftSection={<IconLogout size={16} />} onClick={onLogout}>
            Wyloguj
          </Button>
        </Stack>
      </AppShell.Navbar>

      <AppShell.Header>
        <Group h="100%" px="lg" justify="space-between">
          <Group>
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
              color="white"
              aria-label="Toggle navigation"
            />
            <Avatar color="indigo" radius="md">
              {student?.nameSurname
                ?.split(" ")
                .map((p) => p[0])
                .join("")
                .toUpperCase() || "?"}
            </Avatar>
            <Stack gap={2}>
              <Title order={4} lh={1.2}>
                Dzienniczek Librus
              </Title>
              <Group gap="xs">
                <Text size="sm" c="dimmed">
                  {student?.nameSurname || "Uczeń"}
                </Text>
                {student?.class && (
                  <Badge size="sm" variant="light" color="indigo">
                    Klasa {student.class}
                  </Badge>
                )}
              </Group>
            </Stack>
          </Group>

          <Group gap="xs">
            {onRefresh ? (
              <Tooltip label="Odśwież oceny" withArrow>
                <ActionIcon
                  variant="light"
                  color="indigo"
                  size="lg"
                  radius="md"
                  loading={loading}
                  onClick={onRefresh}
                >
                  <IconRefresh size={18} />
                </ActionIcon>
              </Tooltip>
            ) : null}
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Main style={{ paddingInline: "clamp(12px, 4vw, 32px)" }}>{children}</AppShell.Main>
    </AppShell>
  );
};

export default AppShellLayout;
