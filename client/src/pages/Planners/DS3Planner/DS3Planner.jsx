import { useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { getAnonymousUserId } from '../../../services/anonymousUserId.js';
import buildService from '../../../services/builds.js';

import AuthContext from '../../../context/AuthContext.jsx';
import DS3BuildContext from '../../../context/DS3BuildContext.jsx';

import { ATTRIBUTES, STARTING_CLASSES } from '../../../constants/darkSouls3.js';
import startingClasses from '../../../assets/dark-souls-3/starting-classes.json';

import Title from '../../../components/planners/common/Title/Title.jsx';
import CharacterName from '../../../components/planners/common/CharacterName/CharacterName.jsx';
import Gender from '../../../components/planners/common/Gender/Gender.jsx';
import StartingClass from '../../../components/planners/common/StartingClass/StartingClass.jsx';
import SoulLevel from '../../../components/planners/common/SoulLevel/SoulLevel.jsx';
import MiniCaption from '../../../components/planners/common/MiniCaption/MiniCaption.jsx';
import AttributeIO from '../../../components/planners/common/AttributeIO/AttributeIO.jsx';
import { getStartingClassData } from '../../../utils/index.js';

const DS2Planner = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { authInfo } = useContext(AuthContext);
  const { build, buildDispatch, setTitle, setCharacterName, setGender, setStartingClass, setAttribute } =
    useContext(DS3BuildContext);

  const [buildOwner, setBuildOwner] = useState({ username: null, id: null });
  const [isLoading, setIsLoading] = useState(true);

  const startingClassData = getStartingClassData(startingClasses, build.character.startingClass);

  const checkOwner = useCallback(() => {
    if (authInfo.id) {
      setBuildOwner({ username: authInfo.username, id: authInfo.id });
    } else {
      const anonymousUserId = getAnonymousUserId();
      setBuildOwner({ username: 'Anonymous', id: anonymousUserId });
    }
  }, [authInfo.id, authInfo.username]);

  async function saveBuild(newBuild) {
    try {
      await buildService.saveGameBuild('dark-souls-3', newBuild);
      console.log('Character saved successfully!');
    } catch (error) {
      console.error('Error saving character', error);
    }
  }

  async function updateBuild(id, updatedBuild) {
    try {
      await buildService.updateGameBuild('dark-souls-3', id, updatedBuild);
      console.log('Character updated successfully!');
    } catch (error) {
      console.error('Error updating character', error);
    }
  }

  const loadBuild = useCallback(
    async (id) => {
      try {
        const loadedBuild = await buildService.getBuildById('dark-souls-3', id);

        if (loadedBuild.user) {
          setBuildOwner({ username: loadedBuild.user.username, id: loadedBuild.user.id });
        } else {
          setBuildOwner({ username: 'Anonymous', id: loadedBuild.anonymousUserId });
        }

        const buildData = {
          title: loadedBuild.title,
          description: loadedBuild.description,
          isPublic: loadedBuild.isPublic,
          tags: loadedBuild.tags,
          character: loadedBuild.character
        };

        buildDispatch({ type: 'LOAD_BUILD', payload: buildData });
        setIsLoading(false);
      } catch (error) {
        console.log('There was an error loading the build:', error);
      }
    },
    [buildDispatch]
  );

  const resetBuild = useCallback(() => {
    buildDispatch({ type: 'RESET_BUILD' });
    setIsLoading(false);
  }, [buildDispatch]);

  useEffect(() => {
    checkOwner();
    id ? loadBuild(id) : resetBuild();
  }, [id, checkOwner, loadBuild, resetBuild]);

  function handleSubmit(event) {
    event.preventDefault();
    id ? updateBuild(id, build) : saveBuild(build);
    navigate('/');
  }

  function handleDelete(event) {
    event.preventDefault();
    buildService.deleteGameBuild('dark-souls-3', id);
    navigate('/');
  }

  function handleCancel(event) {
    event.preventDefault();
    id ? navigate('/explorer') : navigate('/planner');
  }

  let isUserOwner = false;

  if (authInfo.id) {
    isUserOwner = authInfo.id === buildOwner.id;
  } else {
    const anonymousUserId = getAnonymousUserId();
    isUserOwner = anonymousUserId === buildOwner.id;
  }

  if (isLoading)
    return (
      <main className="u-mainPage">
        <h2>{id ? 'Edit' : 'Create'} DS3 Character</h2>
        <hr className="u-hr" />
        <div>Loading...</div>
      </main>
    );

  return (
    <main className="u-mainPage">
      <h2>{id ? 'Edit' : 'Create'} DS3 Character</h2>
      <hr className="u-hr" />
      {isUserOwner ? null : (
        <span>
          Viewing <strong>{buildOwner.username}</strong> build
        </span>
      )}
      <form onSubmit={handleSubmit}>
        <Title value={build.title} onChange={setTitle} />
        <div className="u-container">
          <CharacterName
            value={build.character.name}
            onChange={setCharacterName}
            maxLength={16} // This is the character name limit in game
            placeholder="Ashen One"
          />
          <Gender value={build.character.gender} onChange={setGender} options={['male', 'female']} />
          <StartingClass value={build.character.startingClass} onChange={setStartingClass} options={STARTING_CLASSES} />
        </div>
        <div className="u-container">
          <SoulLevel
            soulLevelBase={startingClassData.soulLevelBase}
            basePoints={startingClassData.basePoints}
            attributes={build.character.attributes}
          />
          <MiniCaption />
          {ATTRIBUTES.map((attr) => (
            <AttributeIO
              key={attr}
              character={build.character}
              startingClasses={startingClasses}
              attribute={attr}
              updateAttributeValue={setAttribute}
            />
          ))}
        </div>
        {isUserOwner ? (
          <div>
            <button type="submit">{id ? 'Update' : 'Save'}</button>
            {id && <button onClick={handleDelete}>Delete</button>}
          </div>
        ) : null}
        <button onClick={handleCancel}>Go back</button>
      </form>
    </main>
  );
};

export default DS2Planner;
