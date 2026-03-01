import {Stack} from "expo-router";
import {ChallengesProvider} from "../context/ChallengesContext";
import {ResultsProvider} from "../context/ResultsContext";
import {UserProvider} from "../context/UserContext";

const Layout = () => {

    return (
        <ResultsProvider>
            <ChallengesProvider>
                <UserProvider>
                    {/*<Auth0Provider domain={"dev-usah3m5hn5jj5zf6.us.auth0.com"}*/}
                    {/*               clientId={"2jtbPSZKUCGijGUZjxcTOTfifH5Ul8h8"}>*/}
                        <Stack/>
                    {/*</Auth0Provider>*/}
                </UserProvider>
            </ChallengesProvider>
        </ResultsProvider>
    );
}

export default Layout;
