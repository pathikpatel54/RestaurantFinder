import { Container, Paper } from "@mantine/core";
import { selectFavorites } from "../features/favorites/favoriteSlice";
import { useSelector } from "react-redux";
import Cards from "./Cards";

const Favorites = () => {
  const restaurants = useSelector(selectFavorites);
  return (
    <Container>
      <Paper shadow="xl" p="md" withBorder>
        <Cards data={restaurants}></Cards>
      </Paper>
    </Container>
  );
};

export default Favorites;
