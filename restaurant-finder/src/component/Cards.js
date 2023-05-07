import {
  createStyles,
  SimpleGrid,
  Card,
  Image,
  Text,
  Container,
  AspectRatio,
  Rating,
  Group,
  ActionIcon,
  rem,
} from "@mantine/core";
import { IconHeart, IconShare } from "@tabler/icons-react";
import { useDispatch } from "react-redux";
import { saveFavorite } from "../features/favorites/favoriteSlice";
import { notifications } from "@mantine/notifications";

const useStyles = createStyles((theme) => ({
  card: {
    transition: "transform 150ms ease, box-shadow 150ms ease",

    "&:hover": {
      transform: "scale(1.01)",
      boxShadow: theme.shadows.md,
    },
  },

  title: {
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
    fontWeight: 600,
  },

  footer: {
    padding: `${theme.spacing.xs} ${theme.spacing.lg}`,
    marginTop: theme.spacing.md,
    borderTop: `${rem(1)} solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.gray[2]
    }`,
  },
}));

export default function Cards({ data }) {
  const { classes, theme } = useStyles();
  const dispatch = useDispatch();

  const handleLikeClick = (restaurant) => {
    dispatch(
      saveFavorite({
        restaurant: restaurant,
      })
    );
    notifications.show({
      title: "Added to favorites",
      message: `Restaurant ${restaurant?.name} has been added to favorites`,
    });
  };

  const cards = data?.map((article, i) => (
    <Card key={i} p="md" radius="md" className={classes.card}>
      <AspectRatio ratio={1920 / 1080}>
        <Image src={article?.image_url} />
      </AspectRatio>
      <Text color="dimmed" size="xs" transform="uppercase" weight={700} mt="md">
        {article?.cuisine}
      </Text>
      <Text
        className={classes.title}
        mt={5}
        target="_blank"
        rel="noopener noreferrer"
        component="a"
        href={article?.url}
      >
        {article?.name}
      </Text>
      <Rating value={article?.rating} fractions={2} readOnly />

      <Card.Section className={classes.footer}>
        <Group position="apart">
          <Text fz="xs" c="dimmed">
            Distance:{" "}
            {article?.distance === 0
              ? "Within 1 mile"
              : `Within ${article?.distance} mile`}
          </Text>
          <Group spacing={0}>
            <ActionIcon onClick={() => handleLikeClick(article)}>
              <IconHeart
                size="1.2rem"
                color={theme.colors.red[6]}
                stroke={1.5}
              />
            </ActionIcon>
            <ActionIcon>
              <IconShare
                size="1.2rem"
                color={theme.colors.blue[6]}
                stroke={1.5}
              />
            </ActionIcon>
          </Group>
        </Group>
      </Card.Section>
    </Card>
  ));

  return (
    <Container py="xl">
      <SimpleGrid cols={2} breakpoints={[{ maxWidth: "sm", cols: 1 }]}>
        {cards}
      </SimpleGrid>
    </Container>
  );
}
