(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
function Header(container) {
  container.innerHTML += `
    <h1 class="gnb__title text-title">점심 뭐 먹지</h1>
    <button
      id="gnb-button"
      type="button"
      class="gnb__button"
      aria-label="음식점 추가"
    >
      <img src="./add-button.png" alt="음식점 추가" />
    </button>
  `;
}
function InitHeader() {
  const $headerContainer = document.querySelector(".gnb");
  Header($headerContainer);
}
const CATEGORY_OPTIONS = [
  { value: "한식", text: "한식" },
  { value: "중식", text: "중식" },
  { value: "일식", text: "일식" },
  { value: "양식", text: "양식" },
  { value: "아시안", text: "아시안" },
  { value: "기타", text: "기타" }
];
const DISTANCE_OPTIONS = [
  { value: 5, text: "5분 내" },
  { value: 10, text: "10분 내" },
  { value: 15, text: "15분 내" },
  { value: 20, text: "20분 내" },
  { value: 30, text: "30분 내" }
];
function CustomDropdown({
  label,
  name,
  id,
  options,
  required
}) {
  return `
    <div class="form-item ${"form-item--required"}">
      <label for="${id}" class="text-caption">${label}</label>
      <select name="${name}" id="${id}" ${"required"}>
        <option value="">선택해 주세요</option>
        ${options.map(
    (option) => `<option value="${option.value}">${option.text}</option>`
  ).join("")}
      </select>
    </div>
  `;
}
const MESSAGES = Object.freeze({
  MAXIMUM_NAME_LENGTH: 30,
  MAXIMUM_DESCRIPTION_LENGTH: 1500,
  SELECT_TYPE: 6,
  MAXIMUM_INPUT_LENGTH: 2048
});
function CustomInput({
  label,
  name,
  id,
  type = "text",
  required = false
}) {
  return `
      <div class="form-item ${required && "form-item--required"}">
        <label for="${id}" class="text-caption">${label}</label>
        <input maxlength="${MESSAGES.MAXIMUM_INPUT_LENGTH}" type="${type}" name="${name}" id="${id}" ${required && "required"} />
      </div>
    `;
}
function CustomButton({
  id,
  type,
  className,
  text
}) {
  return `
    <button 
      ${id && `id="${id}"`}
      ${type && `type="${type}"`}
      ${className && `class="button ${className} text-caption"`} 
    >
      ${text}
    </button>
  `;
}
function AddRestaurantModal(container) {
  container.innerHTML += `
        <div class="modal modal--open">
        <div class="modal-backdrop"></div>
        <div class="modal-container">
          <h2 class="modal-title text-title">새로운 음식점</h2>
          <form>
            <!-- 카테고리 -->
             ${CustomDropdown({
    label: "카테고리",
    name: "category",
    id: "category",
    options: CATEGORY_OPTIONS,
    required: true
  })}

            <!-- 음식점 이름 -->
             ${CustomInput({
    label: "이름",
    name: "name",
    id: "name",
    type: "text",
    required: true
  })}
            
            <!-- 거리 -->
              ${CustomDropdown({
    label: "거리(도보 이동 시간)",
    name: "distance",
    id: "distance",
    options: DISTANCE_OPTIONS,
    required: true
  })}
            
            <!-- 설명 -->
            <div class="form-item">
              <label for="description" class="text-caption">설명</label>
              <textarea
                name="description"
                id="description"
                cols="30"
                rows="5"
              ></textarea>
              <span class="help-text text-caption">
                메뉴 등 추가 정보를 입력해 주세요.
              </span>
            </div>

            <!-- 링크 -->
             ${CustomInput({
    label: "참고 링크",
    name: "link",
    id: "link",
    type: "text"
  })}

            <!-- 취소/추가 버튼 -->
            <div class="button-container">
          ${CustomButton({
    id: "close-modal",
    type: "close",
    className: "button--secondary",
    text: "취소하기"
  })}
          ${CustomButton({
    type: "submit",
    className: "button--primary",
    text: "추가하기"
  })}
            </div>
          </form>
        </div>
      </div>
  `;
}
function AddNewRestaurant({ restaurant }) {
  if (!GetAllRestaurants()) {
    localStorage.setItem("restaurants", JSON.stringify([restaurant]));
    return;
  }
  const restaurants = GetAllRestaurants();
  restaurants.push(restaurant);
  localStorage.setItem("restaurants", JSON.stringify(restaurants));
}
function GetAllRestaurants() {
  const data = localStorage.getItem("restaurants") || "[]";
  return JSON.parse(data);
}
function SaveFavoriteRestaurantInStorage(favoriteRestaurant) {
  const allRestaurants = GetAllRestaurants();
  allRestaurants.forEach((restaurant) => {
    if (restaurant.nameValue === favoriteRestaurant.nameValue) {
      restaurant.favorite = favoriteRestaurant.favorite;
    }
  });
  localStorage.setItem("restaurants", JSON.stringify(allRestaurants));
}
function DeleteRestaurant(restaurantName) {
  const allRestaurants = GetAllRestaurants();
  const filteredRestaurants = allRestaurants.filter(
    (restaurant) => restaurant.nameValue !== restaurantName
  );
  localStorage.setItem("restaurants", JSON.stringify(filteredRestaurants));
}
const categoryMapping = {
  한식: "korean",
  중식: "chinese",
  일식: "japanese",
  양식: "western",
  아시안: "asian",
  기타: "etc",
  에러: "error_category"
};
const ERRORS = Object.freeze({
  EMPTY_SELECT: (title) => `${title} 중 하나를 선택해야 합니다.`,
  EMPTY_NAME: "이름은 공백일 수 없습니다.",
  MAXIMUM_NAME: "이름은 30자를 넘길 수 없습니다.",
  MAXIMUM_DESCRIPTION: "설명은 1500자를 넘길 수 없습니다."
});
const validateNameInput = (input) => {
  if (input === "") {
    throw new Error(ERRORS.EMPTY_NAME);
  }
  if (input.length > MESSAGES.MAXIMUM_NAME_LENGTH) {
    throw new Error(ERRORS.MAXIMUM_NAME);
  }
};
const validateDescriptionInput = (input) => {
  if (input.length > MESSAGES.MAXIMUM_DESCRIPTION_LENGTH) {
    throw new Error(ERRORS.MAXIMUM_DESCRIPTION);
  }
};
const validateSelectInput = (selectValue, title) => {
  if (selectValue === "") {
    throw new Error(ERRORS.EMPTY_SELECT(title));
  }
};
function InitModalHandler() {
  const $modalButton = document.getElementById(
    "gnb-button"
  );
  const $appContainer = document.getElementById("app");
  $modalButton.addEventListener("click", () => {
    AddRestaurantModal($appContainer);
    InitModalEvents();
  });
}
function InitModalEvents() {
  const $addRestaurantButton = document.querySelector(
    ".button--primary"
  );
  const $closeModalButton = document.getElementById(
    "close-modal"
  );
  $addRestaurantButton.addEventListener("click", HandleAddRestaurant);
  $closeModalButton.addEventListener("click", CloseModal);
}
function HandleAddRestaurant(e) {
  e.preventDefault();
  const $category = document.getElementById("category");
  const $name = document.getElementById("name");
  const $distance = document.getElementById("distance");
  const $description = document.getElementById(
    "description"
  );
  const $link = document.getElementById("link");
  try {
    const categoryValue = $category.value;
    validateSelectInput(categoryValue, "카테고리");
    const nameValue = $name.value.trim();
    validateNameInput(nameValue);
    const distanceValue = $distance.value;
    validateSelectInput(distanceValue, "거리");
    const descriptionValue = $description.value;
    validateDescriptionInput(descriptionValue);
    const category = categoryMapping[categoryValue];
    const link = $link.value;
    const inputValue = {
      category,
      categoryValue,
      nameValue,
      distanceValue: Number(distanceValue),
      descriptionValue,
      link,
      favorite: false
    };
    AddNewRestaurant({ restaurant: inputValue });
    location.reload();
    CloseModal();
  } catch (error) {
    if (error instanceof Error) {
      alert(
        error.message || "알 수 없는 오류로 인해 새로운 음식점 추가를 실패했습니다."
      );
    }
  }
}
function CloseModal() {
  const $modal = document.querySelector(".modal");
  if ($modal) {
    $modal.remove();
  }
}
function DetailModal(container, inputValue) {
  container.innerHTML += `
      <div class="restaurant-detail-modal-background">
          <div class="restaurant-detail-modal">
              <div class="restaurant-detail-modal-images">
                  <div class="restaurant__category">
                      <img src="./category-${inputValue.category}.png" alt="${inputValue.categoryValue}" class="category-icon"/>
                  </div>
                  <button class="restaurant-favorite-star-button">
                    <img class="restaurant-favorite-star" src=${inputValue.favorite === false ? "./favorite-icon-lined.png" : "./favorite-icon-filled.png"} alt="favorite star"/>
                  </button>
              </div>
              <div class="restaurant-detail-modal-info">
                  <h3 class="restaurant__name text-subtitle">${inputValue.nameValue}</h3>
                  <span class="restaurant__distance text-body">
              캠퍼스부터 ${inputValue.distanceValue}분 내
              </span>
                  <p class="restaurant__detail__modal__distance text-body">${inputValue.descriptionValue}</p>
                  <a href="${inputValue.link}">${inputValue.link}</a>
              </div>
              <div class="restaurant-detail-modal-buttons">
                  <button class="restaurant-detail-modal-delete-button">삭제하기</button>
                  <button class="restaurant-detail-modal-close-button">닫기</button>
              </div>
          </div>
      </div>
      `;
}
function SaveFavoriteRestaurant() {
  const $favoriteButtons = document.querySelectorAll(
    ".restaurant-favorite-star-button"
  );
  $favoriteButtons.forEach((favoriteButton) => {
    favoriteButton.addEventListener("click", (e) => {
      var _a;
      const $restaurantItem = e.target.closest(
        ".restaurant"
      );
      const restaurants = GetAllRestaurants();
      const restaurantName = (_a = $restaurantItem == null ? void 0 : $restaurantItem.querySelector(".restaurant__name")) == null ? void 0 : _a.textContent;
      const restaurant = restaurants.find(
        (restaurant2) => restaurant2.nameValue === restaurantName
      );
      if (!restaurant) return;
      SaveFavoriteRestaurantInStorage({
        ...restaurant,
        favorite: !restaurant.favorite
      });
      location.reload();
    });
  });
}
function SaveFavoriteRestaurantInModal() {
  var _a;
  const $favoriteButtons = document.querySelector(".restaurant-detail-modal");
  const $favoriteButton = $favoriteButtons == null ? void 0 : $favoriteButtons.querySelector(
    ".restaurant-favorite-star-button"
  );
  const $restaurantName = (_a = $favoriteButtons == null ? void 0 : $favoriteButtons.querySelector(".restaurant__name")) == null ? void 0 : _a.textContent;
  $favoriteButton == null ? void 0 : $favoriteButton.addEventListener("click", () => {
    const restaurants = GetAllRestaurants();
    const filteredRestaurant = restaurants.find(
      (restaurant) => restaurant.nameValue === $restaurantName
    );
    if (!filteredRestaurant) return;
    SaveFavoriteRestaurantInStorage({
      ...filteredRestaurant,
      favorite: !filteredRestaurant.favorite
    });
    location.reload();
  });
}
function RestaurantDetailModal() {
  const $app = document.getElementById("app");
  const $restaurant = document.querySelectorAll(
    ".restaurant__name-distance"
  );
  $restaurant.forEach((restaurant) => {
    restaurant.addEventListener("click", (e) => {
      var _a;
      const $restaurant2 = e.target.closest(".restaurant");
      const restaurants = GetAllRestaurants();
      const restaurantName = (_a = $restaurant2 == null ? void 0 : $restaurant2.querySelector(".restaurant__name")) == null ? void 0 : _a.textContent;
      const restaurantValues = restaurants.find(
        (restaurant2) => restaurant2.nameValue === restaurantName
      );
      if (!restaurantValues) return;
      DetailModal($app, restaurantValues);
      SaveFavoriteRestaurantInModal();
      DeleteModalEvent();
      CloseModalEvent();
    });
  });
}
function DeleteModalEvent() {
  const $deleteButton = document.querySelector(
    ".restaurant-detail-modal-delete-button"
  );
  $deleteButton == null ? void 0 : $deleteButton.addEventListener("click", (e) => {
    var _a;
    const $detailModal = e.target.closest(
      ".restaurant-detail-modal"
    );
    const $restaurantName = (_a = $detailModal == null ? void 0 : $detailModal.querySelector(".restaurant__name")) == null ? void 0 : _a.textContent;
    DeleteRestaurant($restaurantName);
    alert(`${$restaurantName} 음식점이 삭제되었습니다.`);
    location.reload();
  });
}
function CloseModalEvent() {
  const $closeModalButton = document.querySelector(
    ".restaurant-detail-modal-close-button"
  );
  $closeModalButton.addEventListener("click", () => {
    const $modal = document.querySelector(
      ".restaurant-detail-modal-background"
    );
    $modal == null ? void 0 : $modal.remove();
    location.reload();
  });
  CloseOnDarkBackground();
}
function CloseOnDarkBackground() {
  const $modalBackground = document.querySelector(
    ".restaurant-detail-modal-background"
  );
  $modalBackground.addEventListener("click", (e) => {
    if (e.target === $modalBackground) {
      $modalBackground.remove();
      location.reload();
    }
  });
}
function CreateRestaurantList(restaurants) {
  const $restaurantListContainer = document.querySelector(
    ".restaurant-list-container"
  );
  const restaurantList = document.createElement("ul");
  restaurantList.className = "restaurant-list";
  restaurants.sort((a, b) => {
    return a.nameValue.localeCompare(b.nameValue);
  });
  restaurants.forEach((restaurant) => {
    createRestaurantItem(restaurantList, restaurant);
  });
  $restaurantListContainer.innerHTML = restaurantList.outerHTML;
  RestaurantDetailModal();
  SaveFavoriteRestaurant();
}
function createRestaurantItem(container, inputValue) {
  container.innerHTML += `
    <li class="restaurant">
      <div class="restaurant__category">
        <img src="./category-${inputValue.category}.png" alt="${inputValue.categoryValue}" class="category-icon"/>
      </div>
      <div class="restaurant__info">
        <div class="restaurant-info-header">
          <div class="restaurant__name-distance">
            <h3 class="restaurant__name text-subtitle">${inputValue.nameValue}</h3>
            <span class="restaurant__distance text-body">
            캠퍼스부터 ${inputValue.distanceValue}분 내
            </span>
          </div>
          <button class="restaurant-favorite-star-button">
            <img class="restaurant-favorite-star" src=${inputValue.favorite === false ? "./favorite-icon-lined.png" : "./favorite-icon-filled.png"} alt="favorite star"/>
          </button>
        </div>
        <p class="restaurant__description text-body">${inputValue.descriptionValue}</p>
      </div>
    </li>
  `;
}
function FilterByValue() {
  const $categorySelect = document.getElementById(
    "category-filter"
  );
  const $restaurantList = document.querySelector(
    ".restaurant-list"
  );
  const allRestaurants = Array.from(
    document.querySelectorAll(".restaurant")
  );
  $categorySelect.addEventListener("change", (e) => {
    FilterByValueEvent({ e, allRestaurants, $restaurantList });
  });
}
function FilterByValueEvent({
  e,
  allRestaurants,
  $restaurantList
}) {
  const target = e.target;
  if (target.value === "전체") {
    $restaurantList.innerHTML = "";
    allRestaurants.forEach((item) => {
      $restaurantList.appendChild(item);
    });
    return;
  }
  const filteredItems = allRestaurants.filter((item) => {
    const category = item.querySelector(".category-icon");
    return (category == null ? void 0 : category.alt) === target.value;
  });
  $restaurantList.innerHTML = "";
  filteredItems.forEach((item) => {
    $restaurantList.appendChild(item);
  });
}
function OrderByValue() {
  const $sortSelect = document.getElementById(
    "sorting-filter"
  );
  $sortSelect.addEventListener("change", (e) => {
    const $restaurantList = document.querySelector(
      ".restaurant-list"
    );
    const $restaurantItems = Array.from(
      document.querySelectorAll(".restaurant")
    );
    const target = e.target;
    if (target.value === "name") {
      SortByName({ $restaurantList, $restaurantItems });
    } else if (target.value === "distance") {
      SortByDistance({ $restaurantList, $restaurantItems });
    }
  });
}
function SortByName({ $restaurantList, $restaurantItems }) {
  const sortedItems = $restaurantItems.sort((a, b) => {
    var _a, _b;
    const aName = ((_a = a.querySelector(".restaurant__name")) == null ? void 0 : _a.textContent) ?? "";
    const bName = ((_b = b.querySelector(".restaurant__name")) == null ? void 0 : _b.textContent) ?? "";
    return aName.localeCompare(bName);
  });
  $restaurantList.innerHTML = "";
  sortedItems.forEach((item) => {
    $restaurantList.appendChild(item);
  });
}
function SortByDistance({ $restaurantList, $restaurantItems }) {
  const sortedItems = [...$restaurantItems].sort((a, b) => {
    var _a, _b;
    const aDistanceText = ((_a = a.querySelector(".restaurant__distance")) == null ? void 0 : _a.textContent) ?? "";
    const bDistanceText = ((_b = b.querySelector(".restaurant__distance")) == null ? void 0 : _b.textContent) ?? "";
    const aDistance = parseFloat(aDistanceText.replace(/[^0-9]/g, "")) || 0;
    const bDistance = parseFloat(bDistanceText.replace(/[^0-9]/g, "")) || 0;
    return aDistance - bDistance;
  });
  $restaurantList.innerHTML = "";
  sortedItems.forEach((item) => {
    $restaurantList.appendChild(item);
  });
}
function HeaderCategory() {
  const $allButton = document.getElementById("all-button");
  const $favoriteButton = document.getElementById(
    "favorite-button"
  );
  FilterByValue();
  OrderByValue();
  const restaurants = GetAllRestaurants();
  const favoriteList = restaurants.filter((restaurant) => restaurant.favorite);
  $allButton.addEventListener("click", () => {
    updateUI({ $allButton, $favoriteButton, restaurants, isFavorite: false });
  });
  $favoriteButton.addEventListener("click", () => {
    updateUI({
      $allButton,
      $favoriteButton,
      restaurants: favoriteList,
      isFavorite: true
    });
  });
}
function updateUI({
  $allButton,
  $favoriteButton,
  restaurants,
  isFavorite
}) {
  if (isFavorite) {
    $favoriteButton.classList.add("active");
    $allButton.classList.remove("active");
  } else {
    $allButton.classList.add("active");
    $favoriteButton.classList.remove("active");
  }
  const $restaurantFilterContainer = document.querySelector(
    ".restaurant-filter-container"
  );
  if ($restaurantFilterContainer) {
    $restaurantFilterContainer.classList.toggle("active", isFavorite);
  }
  CreateRestaurantList(restaurants);
}
function InitRestaurantList() {
  const $allButton = document.getElementById("all-button");
  $allButton.classList.add("active");
  const restaurants = GetAllRestaurants();
  CreateRestaurantList(restaurants);
  HeaderCategory();
}
addEventListener("load", () => {
  InitHeader();
  InitRestaurantList();
  InitModalHandler();
});
