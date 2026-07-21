const TournamentMatch = ({
  firstPhoto,
  secondPhoto,
  onSelectPhoto,
}) => {
  return (
    <div className="flex flex-col items-center gap-3">
      {firstPhoto && secondPhoto && (
        <>
          <button
            type="button"
            onClick={() => onSelectPhoto(firstPhoto)}
            className="w-full"
          >
            <img
              src={firstPhoto.previewUrl}
              alt="위 후보 사진"
              className="mx-auto w-full rounded-xl object-cover"
            />
          </button>

          <span className="text-sm font-medium">
            vs
          </span>

          <button
            type="button"
            onClick={() => onSelectPhoto(secondPhoto)}
            className="w-full"
          >
            <img
              src={secondPhoto.previewUrl}
              alt="아래 후보 사진"
              className="mx-auto w-full rounded-xl object-cover"
            />
          </button>
        </>
      )}
    </div>
  );
};

export default TournamentMatch;