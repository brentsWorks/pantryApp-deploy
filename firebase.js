import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
	apiKey: "AIzaSyBt7cQDNbcjbKoBQfbI9ygoKzMniVU6oeI",
	authDomain: "inventory-management-app-6e095.firebaseapp.com",
	projectId: "inventory-management-app-6e095",
	storageBucket: "inventory-management-app-6e095.appspot.com",
	messagingSenderId: "974178593312",
	appId: "1:974178593312:web:79e0b41627ea6744fb2a45",
 };
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
export { firestore };
