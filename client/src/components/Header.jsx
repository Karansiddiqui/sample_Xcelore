import { Avatar, Button, Dropdown, Navbar } from "flowbite-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { signoutSucess } from "../redux/user/userSlice";
import SearchIcon from "@mui/icons-material/Search";

export default function Header() {
  const path = useLocation().pathname;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);


  const handleSignout = async () => {
    try {
      const res = await fetch("/api/user/signout", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        console.log(data.message);
      } else {
        dispatch(signoutSucess());
        navigate("/sign-in");
      }
    } catch (error) {
      console.log(error.message);
    }
  };


  return (
    <Navbar
      fluid
      rounded
      className="border-b-2 fixed z-50 w-full bg-transparent backdrop-blur-3xl dark:bg-transparent"
    >
      <Link
        to={"/"}
        className="self-center whitespace-nowrap text-sm md:text-xl font-semibold dark:text-white"
      >
        <div className="flex">
          <div className="border-slate-900 bg-slate-900 border-2 text-white w-12 md:w-20 text-right pr-1 rounded-l-md dark:text-black dark:bg-white dark:border-white">
            Sample
          
          </div>
        </div>
      </Link>

      <Button
        className="w-9 h-9  sm:hidden items-center"
        color="gray"
        pill
        onClick={() => {
          navigate("/search");
        }}
      >
        <SearchIcon />
      </Button>

      <div className="flex gap-2 md:order-2">
        {currentUser ? (
          <Dropdown
            arrowIcon={false}
            inline
            label={
              <Avatar
                alt="user"
                img={currentUser.profilePicture}
                rounded
                className="object-cover"
              />
            }
          >
            <Dropdown.Header>
              <span className="block text-sm">
                <span className=" font-bold text-base">User: </span> @
                {currentUser.username}
              </span>
              <span className="block text-sm font-medium truncate">
                <span className=" font-bold text-base">Mail: </span>
                {currentUser.email}
              </span>
            </Dropdown.Header>
            <Link to={"/dashboard?tab=profile"}>
              <Dropdown.Item>Profile</Dropdown.Item>
            </Link>
            <Dropdown.Divider />
            <Dropdown.Item onClick={handleSignout}>Sign Out</Dropdown.Item>
          </Dropdown>
        ) : (
          <Link to="/sign-in">
            <Button gradientDuoTone="purpleToBlue" outline>
              Sign In
            </Button>
          </Link>
        )}
        <Navbar.Toggle />
      </div>
      <Navbar.Collapse className="">
        <Link to={"/"}>
          <Navbar.Link active={path === "/"} as={"div"} className="flex justify-center">
            {" "}
            Home
          </Navbar.Link>
        </Link>
        <Link to={"/about"}>
          <Navbar.Link className="flex justify-center" active={path === "/about"} as={"div"}>
            About
          </Navbar.Link>
        </Link>
      </Navbar.Collapse>
    </Navbar>
  );
}
