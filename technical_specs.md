** Code Documentation **

**1. App.js**
    **Overview**
    The application uses a NavigationContainer to manage navigation between different screens. It also integrates a StripeProvider for handling Stripe payments and utilizes Firebase Authentication to manage user sessions.

    **Key Components and Libraries**
    1. React Navigation: Manages the navigation of the app through a stack navigator that includes screens for login, profile setup, and the main app interface.
    2. Firebase Authentication: Monitors and manages the user's authentication state.
    3. Stripe Provider: Configures Stripe with necessary credentials to handle payments and merchant interactions.
    4. Firebase Firestore: Used to fetch and store user data, such as profile completion status.
    5. React Native Paper Dates: Manages date inputs and translations, enhancing form functionalities.
    6. AuthContext and ListingsProvider: Custom context providers that manage user data and listing data across the app.

    **Functionalities and Flow**
    - AppContainer
        Serves as the root component that wraps the entire application within the StripeProvider and NavigationContainer.
        It initializes the AuthProvider and ListingsProvider to manage global state related to authentication and listings.
    - MainNavigator
        - The navigator setup within MainNavigator uses a stack navigator to manage the transition between different screens.
        - Authentication state is monitored using onAuthStateChanged, which sets the initial route based on whether the user is logged in, their email is verified, and whether their profile is complete.
        - Dynamically sets the initial navigation route to either 'Home', 'ProfileSetup', or 'Login' based on user authentication and profile status.

    **Dynamic Linking and Translations**
    - Configures deep linking with the linking configuration, allowing the app to handle open URLs that match predefined patterns.
    - Registers translations for date handling, providing localized strings for date operations in forms.

    **Error Logging**
    Console logging is used throughout to capture key lifecycle events (e.g., uploads, Firestore writes) and surface any caught exceptions for easier debugging during development.

    **Error Handling and Performance Considerations**
    - The setup includes comprehensive error handling, especially around authentication and data fetching using Firebase.
    - Performance is optimized by managing state and context efficiently, reducing the need for redundant data fetching or state updates.

**2. Home-Page.js** 
*(General Screen Layout/usage, using ListingsContext to retrieve listings)*
    **Overview**
    The Home screen component is the main screen for the "Campus Closet" app. It displays listings that are currently trending and those that have been added recently. The component makes use of navigation to move between different screens and utilizes context to manage data related to listings and the authentication status of users.

    **Key Components Explained**
    - React Navigation Stack: Allows users to navigate between different screens in the app.
    Components Used:
        1. Stack.Navigator: Manages the screens as a stack, where you can push and pop screens.
        2. Stack.Screen: Represents each screen in the stack.

    *Home Component:* 
    Sets up the navigation stack.
        1. HomeMain: The primary view users see with listings.
        2. ListingScreen: Displays details of a specific listing when selected.
    
    *HomeMain Component*
    Displays the main content on the Home screen.
    - Shows an image banner. Lists "Trending" and "Just In" listings using scrollable rows.
    
    Checks Authentication: Displays content only if the user is logged in.

    **Layout:**
    - SafeAreaView: Ensures the content is displayed in a safe area of the app, not hidden by any device-specific notches or edges.
    - ScrollView: Allows content to be scrollable vertically.
    - Trending and Just In Sections: Each section uses a horizontal ScrollView to display listings that users can scroll through horizontally.

    - TouchableOpacity: Each listing is wrapped in this component to make it touchable, leading to the ListingScreen with details on tap.
    
    **Styles**
    Styling is done using the StyleSheet.create method:
    
    **Usage Tips**
    - Navigation: Use the navigation prop passed to components to navigate between screens.
    - Contexts: Utilize contexts to access global data like user info and listings.
    - Images: Use ExpoImage for optimized image handling in React Native.Overview
    
**3. Profile-Setup-Screen.js**
    *Firebase Auth, using contexts to update Firestore database, using StripeService*

    **Overview**
    *The ProfileSetup component allows users to set up or update their profile within the "Campus Closets" app. Users can enter personal information such as name, phone number, graduation year, Instagram handle, bio, and a profile picture. The component also integrates with Firebase for data storage and Stripe for payment processing.*

    **Key Components and Libraries**
    1. React Native Components: View, Text, TextInput, TouchableOpacity, Modal, SafeAreaView, KeyboardAvoidingView, ActivityIndicator.
    2. Firebase Firestore: Used to store and retrieve user data.
    3. Firebase Auth: Manages authentication to identify the current user.
    4. Expo Image: Enhanced image component from Expo for handling images.
    5. React Navigation: Provides navigation functionality.
    6. Stripe Service: Handles payment and customer data integration with Stripe.

    **Authentication and Context**
    - AuthContext: Provides access to the user's authentication status and functions to set profile completion.
    - Firebase Auth: Checks the current user's authentication status to ensure updates are made against the correct user profile.

    **Form Handling**
    - TextInput: Used for user input fields to capture data such as name, phone number, graduation year, Instagram handle, and bio.
    - Validation: Checks are performed to ensure all required fields are filled and data like phone numbers are in the correct format before submitting.
    - Image Handling: Allows users to select and upload a profile picture using functions imported from imageService.

    **Stripe Integration**
    - Stripe Service: Utilized to create necessary customer and account data in Stripe based on user input. This is critical for payment processing and account management within the app.

    **Submission and Update**
    - handleSubmit: This function orchestrates the update process, including:
        1. Validating input data.
        2. Uploading the profile picture if it's changed.
        3. Creating or updating Stripe data.
        4. Updating the user profile in Firebase Firestore.
        5. Handling navigation upon successful profile update.

        
    **Error Handling and Feedback**
    - Alerts: Provide feedback to the user if there are errors or when the profile is updated successfully.
    - ActivityIndicator: Shows a loading state while the profile is being updated.

4. **Auth Context**
    *(Firebase auth, firebase firestore database, creating react contexts)*

    **What is a context?**
    In React, a Context provides a way to pass data through the component tree without having to manually pass props down at every level. Essentially, it allows you to share values like state and functions between components without having to use props drilling, which can make the code cleaner and easier to maintain.

    **Overview**
    The AuthProvider component is a context provider in React that manages the authentication state and user-specific data within the "Campus Closets" app. It uses Firebase Auth for authentication and Firestore for storing and retrieving user data. This component is crucial for handling user sessions and interactions with the app’s data.

    **Key Components and Libraries**
    1. Firebase Auth: Manages user authentication state.
    2. Firebase Firestore: Stores and retrieves user data such as liked listings and profile details.
    3. React Context: Provides a way to pass data through the component tree without having to pass props down manually at every level.
    
    **Component Structure**
    - State Management
        - useState: Used to manage state variables such as user, userData, isProfileComplete, likedListings, and likedListingsData.
        - user: Tracks the currently authenticated user.
        - userData: Stores data related to the authenticated user fetched from Firestore.
        - isProfileComplete: Boolean that indicates whether the user's profile is completely set up.
        - likedListings: An array of listing IDs that the user has liked.
        - likedListingsData: Stores detailed data about the listings the user has liked.
        
    **Authentication and Data Fetching**
    - useEffect with onAuthStateChanged: Listens for changes in the user's authentication state. When a user logs in, it fetches the user's data from Firestore and subscribes to updates.
    - onSnapshot: Used to listen for real-time updates to the user's document in Firestore, updating local state as necessary.
    
    **Helper Functions**
    - fetchLikedListings: Fetches detailed data for listings that the user has liked from Firestore.
    - addLikedListing and removeLikedListing: Functions to add or remove a liked listing, respectively, updating both the user's document and the listing's like count in Firestore.
    - addListingReferenceToUser and removeListingReferenceFromUser: Manage references to listings owned or created by the user, updating the user's Firestore document.
    - getAccountId: Retrieves the Stripe account ID associated with a user, facilitating transactions or subscription management.
    - fetchInstaById: Fetches the Instagram handle associated with a user by their user ID.

    **Usage Example**
    Context Provider: <AuthContext.Provider> wraps the entire component tree in the app, allowing any child component to access the authentication state and functions via useContext(AuthContext).

    **Error Handling**
    Errors in Firestore operations or data fetching are logged to the console, and user states are reset if authentication changes or errors occur.
    
    **Possible Enhancements**
    - Security Enhancements: Implement more robust error handling and security checks.
    - Performance Optimization: Optimize Firestore interactions to reduce read and write operations.
    - User Experience: Provide more feedback to the user about the status of data operations, especially when interacting with Firestore or Firebase Auth.

**5. functions/index.js**
    *This code snippet contains several Firebase cloud functions designed to integrate with Stripe's API for managing customers, accounts, and payment transactions within an application. Here's a summary of what each function accomplishes:*

    **Key Details**
    - Each function uses Firebase's onRequest method to handle HTTP requests and responses.
    - Functions interact with Stripe via the Stripe Node.js library, initialized with a secret key stored in the environment variables.
    - Error handling is implemented in each function to catch and respond to exceptions, usually logging the error and returning an appropriate HTTP status code with the error message.
    - Security is managed using Firebase's environment configuration to store sensitive information like Stripe's secret key.

    **Basically**
    Each cloud function acts like a node.js endpoint. Everytime you need to create a new one, follow the structure of ones already in the doc. Stripe documentation is super helpful here, although it's tailored to node.js, not specifically firebase cloud functions so be aware of that.
