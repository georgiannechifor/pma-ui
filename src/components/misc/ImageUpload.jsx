import {useState, useEffect} from 'react';
import {func, string} from 'prop-types';

const ImageUpload = ({
  setImageToUpload,
  defaultImage
}) => {
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    if (defaultImage) {
      setImageUrl(defaultImage);
    }
  }, [defaultImage]);

  const getBase64Image = (image, callback) => {
    let reader = new FileReader();

    if (image) {
      reader.readAsDataURL(image);
      reader.onload = () => {
        callback(reader.result);
      };

      return reader.result;
    }

    return null;
  };
  const uploadFile = image => {
    if (image) {
      getBase64Image(image, setImageToUpload);
      setImageUrl(URL.createObjectURL(image));
    }
  };

  return (
    <>
      <input
        accept="image/*"
        className={imageUrl ? 'hidden' : ''}
        id="inputFile"
        name="inputFile"
        onChange={event => {
          event.persist();
          uploadFile(event.target.files[0]);
        }}
        type="file"
      />
      {
        imageUrl && (
          <div className="w-full bg-white max-h-50vh overflow-hidden flex items-center">
            { /* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="Post Image"
              className="object-cover w-full cursor-pointer hover:opacity-90 transition"
              onClick={() => {
                document.getElementById('inputFile').click();
              }}
              src={imageUrl}
            />
          </div>
        )
      }
    </>
  );
};

ImageUpload.displayName = 'ImageUpload';
ImageUpload.propTypes = {
  setImageToUpload : func.isRequired,
  defaultImage     : string
};

ImageUpload.defaultProps = {
  defaultImage : ''
};

export default ImageUpload;
