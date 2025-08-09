import { BrowserRouter, Routes, Route } from "react-router-dom";
import { NotFound } from "@/NotFound";
import { LandingPage } from "@/webpages/LandingPage";

function App() {
  return(
  <>
    <BrowserRouter>
      <Routes>
        <Route index element={ <LandingPage/> } />
        <Route path="*" element={ <NotFound/> } />
      </Routes>
    </BrowserRouter>
  </>
  );
}

export default App;
