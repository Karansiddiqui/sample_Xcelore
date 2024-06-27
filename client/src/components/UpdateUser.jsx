import { useSelector } from "react-redux";
import { Alert, Button, Modal, TextInput, Label } from "flowbite-react";
import { useEffect, useRef, useState } from "react";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { updateStart, updateFailure } from "../redux/user/userSlice.js";
import { useDispatch } from "react-redux";
import { app } from "../firebase.js";
import {useNavigate} from "react-router-dom";

export default function DashProfile() {
 const navigate = useNavigate();
  const [user, setUser] = useState({});

  const { currentUser, error } = useSelector((state) => state.user);
  const [imageFile, setImageFile] = useState(null);
  const [imageFileUrl, setImageFileUrl] = useState(null);
  const [imageFileUploadProgress, setImageFileUploadProgress] = useState(null);
  const [imageFileUploadError, setImageFileUploadError] = useState(null);
  const [imageFileUploading, setImageFileUploading] = useState(false);
  const [updateUserSuccess, setUpdateUserSuccess] = useState(null);
  const [updateUserError, setUpdateUserError] = useState(null);
  const [formData, setFormData] = useState({
    username: user.username,
    email: user.email,
  });


  const filePickerRef = useRef();
  const dispatch = useDispatch();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const userId = urlParams.get("userID");
    if (userId) {
      const fetchUsers = async () => {
        try {
          const res = await fetch(`/api/user/getUser?userId=${userId}`);
          const data = await res.json();
          if (res.ok) {
            setUser(data.user);
            setFormData((prev) => {
              return {
                ...prev,
                username: data.user.username,
                email: data.user.email,
              };
            });
          }
        } catch (error) {
          console.log(error.message);
        }
      };

      if (currentUser.isAdmin) {
        fetchUsers();
      }
    }
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImageFileUrl(URL.createObjectURL(file));
    }
  };
  useEffect(() => {
    if (imageFile) {
      uploadImage();
    }
  }, [imageFile]);

  const uploadImage = async () => {
    setImageFileUploading(true);
    setImageFileUploadError(null);
    const storage = getStorage(app);
    const fileName = new Date().getTime() + imageFile.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, imageFile);
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

        setImageFileUploadProgress(progress.toFixed(0));
      },
      (error) => {
        setImageFileUploadError(
          "Could not upload image (File must be less than 2MB)"
        );

        setImageFile(null);
        setImageFileUrl(null);
        setImageFileUploading(false);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setImageFileUrl(downloadURL);
          setFormData({ ...formData, profilePicture: downloadURL });
          setImageFileUploading(false);
        });
      }
    );
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };


  const PutData = async () => {
    try {
      dispatch(updateStart());
      const res = await fetch(`/api/user/updateUserByadmin/${user._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        dispatch(updateFailure(data.message));
        setUpdateUserError(data.message);
        console.log("errr");
      } else {
        console.log("update");
        navigate("/dashboard?tab=users");
      }
    } catch (error) {
      dispatch(updateFailure(error.message));
      setUpdateUserError(error.message);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setImageFileUploadProgress(null);
    setUpdateUserError(null);
    setUpdateUserSuccess(null);
    if (Object.keys(formData).length === 0) {
      setUpdateUserError("No changes made");
      return;
    }
    if (imageFileUploading) {
      setUpdateUserError("Please wait for image to upload");
      return;
    }
    PutData();
  };
  useEffect(() => {
    if (updateUserSuccess) {
      const timeoutId = setTimeout(() => {
        setUpdateUserSuccess(null);
      }, 2000);

      return () => clearTimeout(timeoutId);
    }
  }, [updateUserSuccess]);

  return (
    <div className="max-w-lg mx-auto p-3 w-full mt-14">
      <h1 className="my-7 text-center font-semibold text-3xl">Update User</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          ref={filePickerRef}
          hidden
        ></input>
        <div
          className="relative w-32 h-32 self-center cursor-pointer shadow-md overflow-hidden rounded-full"
          onClick={() => filePickerRef.current.click()}
        >
          {imageFileUploadProgress && (
            <CircularProgressbar
              value={imageFileUploadProgress || 0}
              strokeWidth={3.5}
              styles={{
                root: {
                  position: "absolute",
                  top: 0,
                  left: 0,
                },
                path: {
                  stroke: `rgba(242,94,92, ${imageFileUploadProgress / 100})`,
                },
              }}
            />
          )}
          <img
            src={imageFileUrl || user.profilePicture}
            alt="user"
            className={`rounded-full w-full h-full object-cover border-4 border-[lightgray] ${
              imageFileUploadProgress &&
              imageFileUploadProgress < 100 &&
              "opacity-80"
            }`}
          />
        </div>
        {imageFileUploadError && (
          <Alert color="failure">{imageFileUploadError}</Alert>
        )}
        <Label htmlFor="username" className=" block mb-[-12px] text-lg mx-1">
          <span className="text-gray-500">Username</span>
        </Label>
        <TextInput
          type="text"
          id="username"
          placeholder="username"
          defaultValue={user.username}
          onChange={handleChange}
        />
        <Label htmlFor="email" className=" block mb-[-12px] text-lg mx-1">
          <span className="text-gray-500">Email</span>
        </Label>
        <TextInput
          type="text"
          id="email"
          placeholder="email"
          defaultValue={user.email}
          onChange={handleChange}
        />

        <TextInput
          type="password"
          id="password"
          placeholder="Change Password"
          onChange={handleChange}
        />

        {currentUser.isAdmin ? (
          <Button type="submit" gradientDuoTone="pinkToOrange" outline>
            {imageFileUploading ? "loading..." : "Update"}
          </Button>
        ) : (
          <></>
        )}
      </form>
      {updateUserSuccess && (
        <Alert color="success" className="mt-5">
          {updateUserSuccess}
        </Alert>
      )}
      {updateUserError && (
        <Alert color="failure" className="mt-5">
          {updateUserError}
        </Alert>
      )}
    </div>
  );
}
