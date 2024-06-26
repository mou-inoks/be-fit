//Auteur: Salim 
//Dashboard Page
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Container } from "../../Components/Container/Container";
import { SearchBar, Chip } from "react-native-elements";
import { useEffect, useState, useRef } from "react";
import DietType from "../../../data/DietType.json";
import { useRecoilState } from "recoil";
import { selectedDietTypeState } from "../../../recoil/RecoilState";
import { RecipeCard } from "../../Components/RecipeCard/RecipeCard";
import Recipies from "../../../data/Recipies.json";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { AlimentList } from "../AlimentsList/AlimentsList";
import { CameraView, Camera } from "expo-camera";
import BottomDrawer from "react-native-animated-bottom-drawer";

export const Dashboard = () => {
  const [inputValue, setInputValue] = useState("");
  const [search, setSearch] = useState("");
  const [isUseSearching, setIsUserSearching] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const [selectDietType, setSelectedDietType] = useRecoilState(
    selectedDietTypeState
  );
  const bottomDrawerRef = useRef();

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const openDrawer = () => {
    bottomDrawerRef?.current?.open();
  };

  const navigation = useNavigation();

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    bottomDrawerRef.current.close();
    navigation.navigate("AlimentDetail", {
      productId: data,
    });
  };

  const handlePressDietType = (diet) => {
    setSelectedDietType(diet.id);
  };

  const handleNavigateRecipes = (recipe) => {
    navigation.navigate("RecipeDetail", {
      recipeId: recipe,
    });
  };

  const handleOnFocusSearchBar = () => {
    setIsUserSearching(true);
  };

  const handleOnCancelSearchBar = () => {
    setSearch("");
    setIsUserSearching(false);
  };

  const handleOpenCamera = () => {
    if (hasPermission != true) {
      Alert.alert("Autorisation", `Impossible d'accéder à votre camera`);
    }
    openDrawer();
    setScanned(false);
  };

  const handleSubmitEditing = () => {
    setSearch(inputValue);
  };

  return (
    <Container style={{backgroundColor: '#f9f9f9'}}>
      <View style={s.navigationBarArea}>
        <TouchableOpacity>
          <Ionicons name="menu" style={s.icon} />
        </TouchableOpacity>
        <Text style={{ fontWeight: "bold" }}>Vous avez un plat savoureux en tête ?</Text>
        <TouchableOpacity>
          <Ionicons name="notifications" style={s.icon} />
        </TouchableOpacity>
      </View>
      <View
        style={[
          s.searchBarArea,
          { flexDirection: "row", alignItems: "center" },
        ]}
      >
        <SearchBar
          containerStyle={{  flex: 1, backgroundColor: '#f9f9f9' }}
          platform="ios"
          placeholder={
            isUseSearching ? "Entrez au moins 3 caractères" : "Rechercher aliment"
          }
          searchIcon={<Ionicons name="search-outline" style={s.icon} />}
          clearIcon={<></>} // We are setting empty icon because if we overide clear icon we lose also the function
          // clearIcon={<Ionicons name="close-outline" style={s.icon} />}
          value={inputValue}
          cancelButtonTitle="Annuler"
          onChangeText={(e) => setInputValue(e)}
          onFocus={() => handleOnFocusSearchBar()}
          onCancel={() => handleOnCancelSearchBar()}
          onSubmitEditing={() => handleSubmitEditing()}
          returnKeyType="search"
        />
        <TouchableOpacity onPress={handleOpenCamera}>
          <Ionicons name="barcode-outline" style={s.icon} />
        </TouchableOpacity>
      </View>
      {isUseSearching ? (
        <AlimentList searchValue={search} />
      ) : (
        <>
          <View style={s.dietType}>
            <ScrollView horizontal>
              {DietType.map((diet) => (
                <Chip
                  title={diet.label}
                  key={diet.id}
                  type={diet.id === selectDietType ? "outline" : "solid"}
                  onPress={() => handlePressDietType(diet)}
                  containerStyle={s.chip}
                  buttonStyle={diet.id === selectDietType ? s.selectedChipButton : s.chipButton}
                  titleStyle={diet.id === selectDietType ? s.selectedChipTitle : null}
                />
              ))}
            </ScrollView>
          </View>
          <View style={s.recipeSection}>
            <Text style={s.sectionTitleText}>Recettes</Text>
            <ScrollView horizontal>
              {Recipies.filter(
                (recipe) => recipe.diet_type === selectDietType
              ).map((recipe) => (
                <RecipeCard
                  title={recipe.title}
                  key={recipe.id}
                  description={recipe.description}
                  calories={recipe.calories}
                  onPress={() => handleNavigateRecipes(recipe.id)}
                  imageSource={recipe.image_url}
                />
              ))}
            </ScrollView>
          </View>
        </>
      )}
      {hasPermission && (
        <BottomDrawer
          ref={(ref) => (bottomDrawerRef.current = ref)}
          enableSnapping={true}
          snapPoints={[700, 800]}
          overDrag
        >
          <CameraView
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e"],
            }}
            style={s.camera}
          />
        </BottomDrawer>
      )}
    </Container>
  );
};

const s = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
  },
  navigationBarArea: {
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  searchBarArea: {
    height: 60,
  },
  mealListArea: {
    backgroundColor: "black",
  },
  camera: {
    width: "100%",
    height: "100%",
  },
  dietType: {
    paddingTop: 30,
  },
  recipeSection: {
    paddingTop: 20,
  },
  sectionTitleText: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  navigationBarArea: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    height: 60,
  },
  icon: {
    fontSize: 24,
  },
  chip: {
    marginHorizontal: 5 
  },
  chipButton: {
    backgroundColor: "#30d6d6",
  },
  selectedChipButton: {
    backgroundColor: "#2e9999",
  },
  selectedChipTitle: {
    color: "white",
  },
});
