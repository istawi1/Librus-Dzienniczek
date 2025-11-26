import { Button, Group } from "@mantine/core";
import { IconBrandGoogle, IconBrandTwitter } from "@tabler/icons-react";

export const GoogleButton = (props) => (
  <Button
    leftSection={<IconBrandGoogle size={16} />}
    variant="default"
    radius="xl"
    fullWidth
    {...props}
  >
    Google
  </Button>
);

export const TwitterButton = (props) => (
  <Button
    leftSection={<IconBrandTwitter size={16} />}
    variant="default"
    radius="xl"
    fullWidth
    {...props}
  >
    Twitter
  </Button>
);

export const SocialButtonsRow = ({ children }) => (
  <Group grow mb="md" mt="md">
    {children}
  </Group>
);
