import {
  Box,
  Button,
  Checkbox,
  Container,
  Divider,
  Grid,
  Group,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconLock, IconLogin, IconShield, IconUser } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { useNavigate } from "react-router-dom";
import { loginRequest } from "../api/client";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const form = useForm({
    initialValues: {
      login: "",
      password: "",
      remember: true,
    },
    validate: {
      login: (value) => (!value ? "Wpisz login do Librusa" : null),
      password: (value) => (!value ? "Hasło jest wymagane" : null),
    },
  });

  const mutation = useMutation({
    mutationFn: loginRequest,
    onSuccess: (data) => {
      login(data);
      notifications.show({
        title: "Zalogowano",
        message: `Witaj ${data?.user?.student?.nameSurname || ""}`,
        color: "teal",
      });
      navigate("/grades");
    },
    onError: (error) => {
      notifications.show({
        title: "Błąd logowania",
        message: error?.response?.data?.message || "Niepoprawny login lub hasło",
        color: "red",
      });
    },
  });

  const handleSubmit = (values) => {
    mutation.mutate(values);
  };

  return (
    <Box
      component="main"
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at 20% 20%, rgba(40, 65, 120, 0.25), transparent 35%), radial-gradient(circle at 80% 10%, rgba(30, 50, 90, 0.28), transparent 30%), #0a1020",
        display: "flex",
        alignItems: "center",
        padding: "32px 16px",
      }}
    >
      <Container size="sm">
        <Paper
          component="form"
          onSubmit={form.onSubmit(handleSubmit)}
          shadow="xl"
          radius="lg"
          withBorder
          p="xl"
          style={{ backgroundColor: "#121826", borderColor: "rgba(255,255,255,0.06)" }}
        >
          <Stack gap="md">
            <div>
              <Text size="xs" c="gray.5">
                Dzienniczek Librus
              </Text>
              <Title order={2} c="white">
                Witaj ponownie
              </Title>
              <Text size="sm" c="gray.4">
                Użyj danych z Librusa, aby zalogować się do panelu.
              </Text>
            </div>

            <Stack gap="sm">
              <TextInput
                required
                label="Login"
                placeholder="np. jan.kowalski"
                leftSection={<IconUser size={18} />}
                radius="md"
                size="md"
                variant="filled"
                styles={{ input: { backgroundColor: "#151c2b", color: "white" } }}
                {...form.getInputProps("login")}
              />
              <PasswordInput
                required
                label="Hasło"
                placeholder="•••••••••"
                leftSection={<IconLock size={18} />}
                radius="md"
                size="md"
                variant="filled"
                styles={{ input: { backgroundColor: "#151c2b", color: "white" } }}
                {...form.getInputProps("password")}
              />
              <Checkbox
                label="Zapamiętaj na tym urządzeniu"
                color="indigo"
                {...form.getInputProps("remember", { type: "checkbox" })}
              />
            </Stack>

            <Stack gap="xs">
              <Button
                type="submit"
                size="md"
                radius="md"
                leftSection={<IconLogin size={18} />}
                loading={mutation.isLoading}
                fullWidth
                color="indigo"
                styles={{ root: { backgroundColor: "#2d3f78" } }}
              >
                Zaloguj się
              </Button>
              <Group gap="xs">
                <IconShield size={18} color="#34d399" />
                <Text size="sm" c="gray.4">
                  Dane logowania nie są zapisywane na serwerze. Sesja jest tymczasowa.
                </Text>
              </Group>
            </Stack>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage;
